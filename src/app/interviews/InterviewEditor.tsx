'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CAREER_LEVEL_LABELS,
  OUTCOME_LABELS,
  type InterviewCareerLevel,
  type InterviewOutcome,
  type InterviewReport,
} from '@/lib/interviews'
import { Button, FilterSelect, useDialog, useToast } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { deleteInterviewReport, saveInterviewReport } from './actions'
import {
  emptyDraft,
  emptyStage,
  findSaveProblems,
  isSameContent,
  toContent,
  toDraft,
  type InterviewDraft,
  type StageDraft,
} from './interviewDraft'
import * as styles from './interviews.css'
import { StageEditor } from './StageEditor'

const CAREER_LEVEL_OPTIONS = Object.entries(CAREER_LEVEL_LABELS).map(([value, label]) => ({ value, label }))
const OUTCOME_OPTIONS = Object.entries(OUTCOME_LABELS).map(([value, label]) => ({ value, label }))

/**
 * 면접 후기 하나를 만들고 고치는 화면. report 가 null 이면 새 후기다.
 *
 * 원문에 없는 값(면접 달·형식·소요 시간)은 비워 둔다 — 글 올린 날이나 짐작으로 채우면 회사별 경향이 틀어진다.
 */
export function InterviewEditor({ report }: { report: InterviewReport | null }) {
  const router = useRouter()
  const { openToast } = useToast()
  const { openConfirm } = useDialog()

  const [reportId, setReportId] = useState<string | null>(report?.id ?? null)
  const [draft, setDraft] = useState<InterviewDraft>(() => (report ? toDraft(report) : emptyDraft()))
  /** 마지막으로 저장된 값. 새 후기는 아직 없다. */
  const [saved, setSaved] = useState<InterviewDraft | null>(() => (report ? toDraft(report) : null))
  /** 실패만 화면에 남긴다. 성공은 토스트로 지나가도 되지만 실패는 고칠 때까지 보여야 한다. */
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const hasUnsavedChanges = saved === null || !isSameContent(draft, saved)
  const questionCount = draft.stages.reduce((sum, stage) => sum + stage.questions.length, 0)

  function patch(next: Partial<InterviewDraft>) {
    setDraft((previous) => ({ ...previous, ...next }))
  }

  function replaceStage(key: string, next: StageDraft) {
    patch({ stages: draft.stages.map((stage) => (stage.key === key ? next : stage)) })
  }

  function moveStage(index: number, offset: -1 | 1) {
    const stages = [...draft.stages]
    const target = index + offset
    const [moved] = stages.splice(index, 1)
    if (!moved || target < 0 || target > stages.length) return
    stages.splice(target, 0, moved)
    patch({ stages })
  }

  function save() {
    const saveProblems = findSaveProblems(draft)
    if (saveProblems.length > 0) {
      setFailure(saveProblems.join('\n'))
      return
    }
    startTransition(async () => {
      const result = await saveInterviewReport(reportId, toContent(draft))
      if (!result.ok || !result.report) {
        setFailure(result.message)
        return
      }
      setFailure(null)
      openToast(result.message)
      // 빈 질문칸은 저장되지 않는다 — 서버가 돌려준 값으로 다시 잡아야 '고친 내용 없음'이 맞는다.
      const savedDraft = toDraft(result.report)
      setDraft(savedDraft)
      setSaved(savedDraft)
      if (reportId === null) {
        setReportId(result.report.id)
        // 새 후기는 저장된 순간부터 제 주소가 있다 — 새로고침해도 같은 후기가 열리게 옮긴다.
        router.replace(`/interviews/${result.report.id}`)
      }
    })
  }

  async function confirmDelete() {
    if (reportId === null) return
    const confirmed = await openConfirm({
      title: '이 면접 후기를 지울까요?',
      description: '단계와 질문까지 모두 지워지고 되돌릴 수 없습니다.',
      confirmButton: '삭제',
    })
    if (!confirmed) return
    startTransition(async () => {
      const result = await deleteInterviewReport(reportId)
      if (!result.ok) {
        setFailure(result.message)
        return
      }
      openToast(result.message)
      router.replace('/interviews')
    })
  }

  return (
    <>
      <a href="/interviews" className={styles.backLink}>
        ⬅️ 면접 후기 목록
      </a>
      <div className={styles.titleRow}>
        <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>
          {reportId === null ? '새 면접 후기' : `${saved?.companyName || draft.companyName} 면접 후기`}
        </h1>
      </div>

      <div className={styles.actionBar}>
        <span className={styles.counter}>
          단계 {draft.stages.length} · 질문 {questionCount}
        </span>
        <span className={styles.pushRight} />
        <Button color="primary" variant="fill" size="small" disabled={isPending || !hasUnsavedChanges} onClick={save}>
          {hasUnsavedChanges ? '저장' : '고친 내용 없음'}
        </Button>
        {reportId !== null && (
          <Button color="danger" variant="weak" size="small" disabled={isPending} onClick={confirmDelete}>
            삭제
          </Button>
        )}
      </div>

      {failure && <p className={styles.failure}>{failure}</p>}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
        </div>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>회사</span>
            <input
              className={shared.input}
              placeholder="토스"
              value={draft.companyName}
              onChange={(event) => patch({ companyName: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>직군</span>
            <input
              className={shared.input}
              placeholder="Backend"
              value={draft.jobCategory}
              onChange={(event) => patch({ jobCategory: event.target.value })}
            />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>경력 구분</span>
            <FilterSelect
              label="경력"
              options={CAREER_LEVEL_OPTIONS}
              value={draft.careerLevel}
              onChange={(careerLevel) => patch({ careerLevel: careerLevel as InterviewCareerLevel | null })}
            />
          </div>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>면접 본 달 (모르면 비움)</span>
            <input
              className={shared.input}
              type="month"
              value={draft.interviewedIn}
              onChange={(event) => patch({ interviewedIn: event.target.value })}
            />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>결과</span>
            <FilterSelect
              label="결과"
              options={OUTCOME_OPTIONS}
              value={draft.outcome}
              hasAllOption={false}
              onChange={(outcome) => outcome && patch({ outcome: outcome as InterviewOutcome })}
            />
          </div>
        </div>
        <div className={`${styles.fieldGrid} ${styles.spacedGrid}`}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>원문 주소</span>
            <input
              className={shared.input}
              placeholder="https://velog.io/@name/post"
              value={draft.sourceUrl}
              onChange={(event) => patch({ sourceUrl: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>원문 제목</span>
            <input
              className={shared.input}
              value={draft.sourceTitle}
              onChange={(event) => patch({ sourceTitle: event.target.value })}
            />
          </label>
        </div>
        <label className={styles.wideField}>
          <span className={styles.fieldLabel}>메모 (전체 인상·준비 팁 등)</span>
          <textarea
            className={`${shared.input} ${styles.textArea}`}
            value={draft.memo}
            onChange={(event) => patch({ memo: event.target.value })}
          />
        </label>
      </section>

      {draft.stages.map((stage, index) => (
        <StageEditor
          key={stage.key}
          stage={stage}
          stageNumber={index + 1}
          isFirst={index === 0}
          isLast={index === draft.stages.length - 1}
          onChange={(next) => replaceStage(stage.key, next)}
          onMove={(offset) => moveStage(index, offset)}
          onRemove={() => patch({ stages: draft.stages.filter((each) => each.key !== stage.key) })}
        />
      ))}

      <div className={styles.addRow}>
        <Button color="primary" variant="weak" size="small" onClick={() => patch({ stages: [...draft.stages, emptyStage()] })}>
          단계 추가
        </Button>
      </div>
    </>
  )
}
