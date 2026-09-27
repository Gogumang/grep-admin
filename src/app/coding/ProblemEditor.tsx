'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CODING_LANGUAGES, type CodingLanguage, FUNCTION_LANGUAGES, isFunctionLanguage } from '@/lib/codingLanguages'
import type { CodingProblem, CodingProblemStatus, ReferenceRunResult } from '@/lib/collector'
import { Badge, Button, FilterSelect, useDialog, useToast } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import {
  loadFunctionStarters,
  publishCodingProblem,
  runReferenceSolution,
  saveCodingProblem,
  unpublishCodingProblem,
  type ProblemActionResult,
} from './actions'
import * as styles from './coding.css'
import { FunctionSignatureEditor } from './FunctionSignatureEditor'
import { MarkdownField } from './MarkdownField'
import {
  countCases,
  emptyDraft,
  findPublishBlockers,
  findSaveProblems,
  isSameContent,
  toContent,
  toDraft,
  toFunction,
  type ProblemDraft,
} from './problemDraft'
import { TestCaseEditor } from './TestCaseEditor'

const LEVEL_OPTIONS = ['1', '2', '3'].map((level) => ({ value: level, label: `Lv. ${level}` }))
const LANGUAGE_OPTIONS = CODING_LANGUAGES.map((language) => ({ value: language, label: language }))
/** 함수 방식 문제는 하네스가 있는 언어로만 참조 풀이를 쓴다. */
const FUNCTION_LANGUAGE_OPTIONS = FUNCTION_LANGUAGES.map((language) => ({ value: language, label: language }))

/**
 * 문제 하나를 만들고 고치는 화면. problem 이 null 이면 새 문제다.
 *
 * 공개·내리기는 저장된 문제에만 한다 — collector 가 저장된 값을 내보내므로, 화면에서 고친 채
 * 공개하면 보이는 것과 나가는 것이 달라진다. 그래서 고친 것이 있으면 공개를 막고 까닭을 적는다.
 */
export function ProblemEditor({ problem }: { problem: CodingProblem | null }) {
  const router = useRouter()
  const { openToast } = useToast()
  const { openConfirm } = useDialog()
  const isNew = problem === null

  const [draft, setDraft] = useState<ProblemDraft>(() => (problem ? toDraft(problem) : emptyDraft()))
  /** 마지막으로 저장된 값. 새 문제는 아직 없다. */
  const [saved, setSaved] = useState<ProblemDraft | null>(() => (problem ? toDraft(problem) : null))
  const [status, setStatus] = useState<CodingProblemStatus>(problem?.status ?? 'draft')
  /** 실패만 화면에 남긴다. 성공은 토스트로 지나가도 되지만 실패는 고칠 때까지 보여야 한다. */
  const [failure, setFailure] = useState<string | null>(null)
  const [compileError, setCompileError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const hasUnsavedChanges = saved === null || !isSameContent(draft, saved)
  const { exampleCount, hiddenCount } = countCases(draft.cases)
  const publishBlockers = findPublishBlockers(draft, hasUnsavedChanges)

  function patch(next: Partial<ProblemDraft>) {
    setDraft((previous) => ({ ...previous, ...next }))
  }

  function applyProblemResult(result: ProblemActionResult) {
    if (!result.ok || !result.problem) {
      // saved 를 그대로 둔다 — collector 는 사이트 커밋이 성공한 뒤에만 DB 에 쓰므로, 실패(github_unavailable 포함)면 저장된 값도 그대로다.
      setFailure(result.message)
      return
    }
    setFailure(null)
    openToast(result.message)
    setSaved(toDraft(result.problem))
    setStatus(result.problem.status)
  }

  function save() {
    const saveProblems = findSaveProblems(draft)
    if (saveProblems.length > 0) {
      setFailure(saveProblems.join('\n'))
      return
    }
    startTransition(async () => {
      const result = await saveCodingProblem(draft.id, toContent(draft))
      applyProblemResult(result)
      // 새 문제는 저장된 순간부터 제 주소가 있다 — 새로고침해도 같은 문제가 열리게 옮긴다.
      if (result.ok && isNew) router.replace(`/coding/${draft.id}`)
    })
  }

  function fillOutputsFromReference() {
    if (!draft.referenceCode.trim()) {
      setFailure('참조 풀이 코드가 비어 있습니다.')
      return
    }
    if (draft.cases.length === 0) {
      setFailure('돌릴 케이스가 없습니다.')
      return
    }
    // 돌리는 동안 케이스를 옮기거나 지울 수 있다 — 번호가 아니라 key 로 결과를 되짚는다.
    const caseKeys = draft.cases.map((testCase) => testCase.key)
    const sentInputByKey = new Map(draft.cases.map((testCase) => [testCase.key, testCase.input]))
    const content = toContent(draft)

    startTransition(async () => {
      const result = await runReferenceSolution({
        language: content.referenceLanguage,
        code: content.referenceCode,
        inputs: content.cases.map((testCase) => testCase.input),
        timeLimitMs: content.timeLimitMs,
        memoryLimitMb: content.memoryLimitMb,
        function: content.function,
      })
      if (!result.ok || !result.run) {
        setFailure(result.message)
        return
      }
      if (result.run.kind === 'compile-error') {
        setFailure(null)
        setCompileError(result.run.message)
        return
      }
      const results = result.run.results
      if (results.length !== caseKeys.length) {
        setFailure(`보낸 입력은 ${caseKeys.length}개인데 결과가 ${results.length}개 왔습니다. 출력을 채우지 않았습니다.`)
        return
      }

      const resultByKey = new Map<string, ReferenceRunResult>(
        caseKeys.flatMap((key, index) => {
          const run = results[index]
          return run ? [[key, run] as const] : []
        }),
      )
      setCompileError(null)
      setFailure(null)
      // 실패한 케이스의 출력은 그대로 둔다 — 에러 메시지나 잘린 출력이 기대 출력으로 저장되면 채점이 조용히 틀린다.
      setDraft((previous) => ({
        ...previous,
        cases: previous.cases.map((testCase) => {
          const run = resultByKey.get(testCase.key)
          // 돌리는 사이 입력을 고친 케이스는 결과가 지금 입력의 것이 아니다.
          if (!run || testCase.input !== sentInputByKey.get(testCase.key)) return testCase
          return run.status === 'ok' ? { ...testCase, output: run.stdout, run } : { ...testCase, run }
        }),
      }))
      const failedCount = results.filter((run) => run.status !== 'ok').length
      openToast(
        failedCount === 0
          ? `케이스 ${caseKeys.length}개의 출력을 채웠습니다.`
          : `${caseKeys.length - failedCount}개를 채웠고 ${failedCount}개는 실행이 실패해 그대로 두었습니다.`,
      )
    })
  }

  /** 함수 방식으로 바꾸면 참조 풀이 언어를 하네스가 있는 언어로 맞춘다 — 그대로 두면 저장이 막힌다. */
  function changeMode(isFunction: boolean) {
    patch({
      isFunction,
      referenceLanguage: isFunction && !isFunctionLanguage(draft.referenceLanguage) ? 'python' : draft.referenceLanguage,
    })
  }

  /** 참조 풀이를 지금 함수 모양의 뼈대로 바꾼다. 적어 둔 풀이가 있으면 먼저 묻는다 — 되돌릴 수 없다. */
  async function replaceReferenceWithStarter() {
    const codingFunction = toFunction(draft)
    if (!codingFunction) return
    if (draft.referenceCode.trim()) {
      const confirmed = await openConfirm({
        title: '참조 풀이를 뼈대로 바꿀까요?',
        description: '지금 적어 둔 참조 풀이는 지워집니다.',
        confirmButton: '바꾸기',
      })
      if (!confirmed) return
    }
    startTransition(async () => {
      const result = await loadFunctionStarters(codingFunction)
      const starter = result.starters?.[draft.referenceLanguage]
      if (!result.ok || starter === undefined) {
        setFailure(result.ok ? `${draft.referenceLanguage} 뼈대를 받지 못했습니다.` : result.message)
        return
      }
      setFailure(null)
      patch({ referenceCode: starter })
    })
  }

  function togglePublished() {
    startTransition(async () => {
      const result =
        status === 'published' ? await unpublishCodingProblem(draft.id) : await publishCodingProblem(draft.id)
      applyProblemResult(result)
    })
  }

  return (
    <>
      <a href="/coding" className={styles.backLink}>
        ⬅️ 문제 목록
      </a>
      <div className={styles.titleRow}>
        <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>
          {isNew ? '새 문제' : saved?.title || draft.id}
        </h1>
        {!isNew && (
          <Badge color={status === 'published' ? 'green' : 'elephant'} variant="weak" size="small">
            {status === 'published' ? '공개' : '초안'}
          </Badge>
        )}
      </div>

      <div className={styles.actionBar}>
        <span className={styles.counter}>
          예시 {exampleCount} · 숨은 {hiddenCount}
        </span>
        <span className={styles.pushRight} />
        <Button color="primary" variant="weak" size="small" disabled={isPending || !hasUnsavedChanges} onClick={save}>
          {hasUnsavedChanges ? '저장' : '고친 내용 없음'}
        </Button>
        {!isNew &&
          (status === 'published' ? (
            <Button color="danger" variant="weak" size="small" disabled={isPending} onClick={togglePublished}>
              내리기
            </Button>
          ) : (
            <Button
              color="primary"
              variant="fill"
              size="small"
              disabled={isPending || publishBlockers.length > 0}
              title={publishBlockers.join(' · ') || undefined}
              onClick={togglePublished}
            >
              공개
            </Button>
          ))}
      </div>

      {failure && <p className={styles.failure}>{failure}</p>}
      {!isNew && status === 'draft' && publishBlockers.length > 0 && (
        <ul className={styles.blockerList} aria-label="공개할 수 없는 까닭">
          {publishBlockers.map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
        </div>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>id (주소에 쓰입니다)</span>
            <input
              className={shared.input}
              value={draft.id}
              disabled={!isNew}
              placeholder="bracket-balance"
              onChange={(event) => patch({ id: event.target.value.trim() })}
            />
            {isNew && <span className={styles.fieldHint}>영소문자·숫자·하이픈. 저장한 뒤에는 바꿀 수 없습니다.</span>}
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>제목</span>
            <input className={shared.input} value={draft.title} onChange={(event) => patch({ title: event.target.value })} />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>난이도</span>
            <FilterSelect
              label="난이도"
              options={LEVEL_OPTIONS}
              value={draft.level}
              hasAllOption={false}
              onChange={(level) => level && patch({ level })}
            />
          </div>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>태그</span>
            <input
              className={shared.input}
              value={draft.tags}
              placeholder="쉼표로 구분 (예: 스택, 문자열)"
              onChange={(event) => patch({ tags: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>시간 제한 (ms, 100~10000)</span>
            <input
              className={shared.input}
              inputMode="numeric"
              value={draft.timeLimitMs}
              onChange={(event) => patch({ timeLimitMs: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>메모리 제한 (MB, 16~1024)</span>
            <input
              className={shared.input}
              inputMode="numeric"
              value={draft.memoryLimitMb}
              onChange={(event) => patch({ memoryLimitMb: event.target.value })}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>지문</h2>
        </div>
        <div className={styles.caseList}>
          <MarkdownField label="문제" value={draft.statement} onChange={(statement) => patch({ statement })} />
          <MarkdownField
            label={draft.isFunction ? '매개변수 설명' : '입력 형식'}
            value={draft.inputFormat}
            onChange={(inputFormat) => patch({ inputFormat })}
          />
          <MarkdownField
            label={draft.isFunction ? '반환값 설명' : '출력 형식'}
            value={draft.outputFormat}
            onChange={(outputFormat) => patch({ outputFormat })}
          />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>풀이 방식</h2>
          <Button color="dark" variant={draft.isFunction ? 'weak' : 'fill'} size="small" onClick={() => changeMode(false)}>
            표준입출력 (백준식)
          </Button>
          <Button color="dark" variant={draft.isFunction ? 'fill' : 'weak'} size="small" onClick={() => changeMode(true)}>
            함수 채우기 (프로그래머스식)
          </Button>
        </div>
        {draft.isFunction ? (
          <>
            <p className={styles.fieldHint}>
              {Object.keys(draft.functionStarters).length > 0
                ? `사이트 편집기에 프로그래머스 기본 코드를 그대로 띄웁니다 (${Object.keys(draft.functionStarters).join(' · ')}). 아래 모양을 바꾸면 기본 코드는 지워지고 모양대로 만든 뼈대를 띄웁니다.`
                : '사이트 편집기에 아래 모양대로 만든 뼈대 코드를 띄웁니다.'}
            </p>
            {/* 모양이 바뀌면 가져온 기본 코드가 맞지 않는다 — 함께 비운다. */}
            <FunctionSignatureEditor value={draft} onChange={(next) => patch({ ...next, functionStarters: {} })} />
          </>
        ) : (
          <p className={styles.fieldHint}>풀이가 표준입력을 읽어 답을 표준출력으로 냅니다. 모든 언어로 풀 수 있습니다.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>참조 풀이</h2>
          <FilterSelect
            label="언어"
            options={draft.isFunction ? FUNCTION_LANGUAGE_OPTIONS : LANGUAGE_OPTIONS}
            value={draft.referenceLanguage}
            hasAllOption={false}
            onChange={(language) => language && patch({ referenceLanguage: language as CodingLanguage })}
          />
          {draft.isFunction && (
            <Button color="dark" variant="weak" size="small" disabled={isPending} onClick={replaceReferenceWithStarter}>
              뼈대 코드로 바꾸기
            </Button>
          )}
        </div>
        <textarea
          className={`${shared.input} ${styles.codeArea}`}
          aria-label="참조 풀이 코드"
          spellCheck={false}
          value={draft.referenceCode}
          onChange={(event) => patch({ referenceCode: event.target.value })}
        />
        {compileError && (
          <>
            <p className={styles.failure}>컴파일 에러 — 출력을 채우지 않았습니다.</p>
            <pre className={styles.runOutput}>{compileError}</pre>
          </>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>테스트 케이스</h2>
          <span className={styles.counter}>
            예시 {exampleCount} · 숨은 {hiddenCount}
          </span>
          <span className={styles.pushRight} />
          <Button
            color="primary"
            variant="weak"
            size="small"
            loading={isPending}
            disabled={isPending}
            onClick={fillOutputsFromReference}
          >
            참조 풀이로 출력 채우기
          </Button>
        </div>
        {draft.isFunction && (
          <p className={styles.fieldHint}>
            입력은 매개변수마다 JSON 한 줄씩 ({draft.functionParameters.map((parameter) => parameter.name || '?').join(' → ')} 순서),
            기대 출력은 반환값 JSON 한 줄입니다 (예: [1,2,3] · &quot;abc&quot; · 7 · true). 참조 풀이로 채우면 반환값이 들어갑니다.
          </p>
        )}
        <TestCaseEditor cases={draft.cases} onChange={(cases) => patch({ cases })} />
      </section>
    </>
  )
}
