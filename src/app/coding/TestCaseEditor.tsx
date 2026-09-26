'use client'

import type { ReferenceRunResult, ReferenceRunStatus } from '@/lib/collector'
import { Badge, Button, Checkbox } from '@/shared'
import * as shared from '@/components/shared.css'
import * as styles from './coding.css'
import { emptyCase, MAXIMUM_CASE_COUNT, type CaseDraft } from './problemDraft'

const RUN_STATUS_LABELS: Record<ReferenceRunStatus, string> = {
  ok: '실행 성공',
  'runtime-error': '런타임 에러',
  'time-limit': '시간 초과',
  'memory-limit': '메모리 초과',
  'output-limit': '출력 초과',
  'judge-error': '채점기 오류',
}

function RunStatus({ run }: { run: ReferenceRunResult }) {
  const isOk = run.status === 'ok'
  return (
    <Badge color={isOk ? 'green' : 'red'} variant="weak" size="small">
      {RUN_STATUS_LABELS[run.status]} · {run.timeMs}ms · {Math.round(run.memoryKb / 1024)}MB
    </Badge>
  )
}

/** 한 칸을 다른 자리로 옮긴 새 배열. 원본은 건드리지 않는다. */
function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  if (moved === undefined) return items
  next.splice(to, 0, moved)
  return next
}

/**
 * 테스트 케이스 목록 편집.
 *
 * 순서가 곧 저장 순서(ordinal)다 — 사이트는 예시를 이 순서대로 보여주므로 위아래로 옮길 수 있게 한다.
 * 입력을 고치면 그 케이스의 참조 풀이 결과를 지운다. 결과가 남아 있으면 지금 입력의 결과로 읽힌다.
 */
export function TestCaseEditor({ cases, onChange }: { cases: CaseDraft[]; onChange: (next: CaseDraft[]) => void }) {
  function update(index: number, patch: Partial<CaseDraft>) {
    onChange(cases.map((testCase, position) => (position === index ? { ...testCase, ...patch } : testCase)))
  }

  function remove(index: number) {
    onChange(cases.filter((_, position) => position !== index))
  }

  const canAdd = cases.length < MAXIMUM_CASE_COUNT

  return (
    <div className={styles.caseList}>
      {cases.map((testCase, index) => (
        <div key={testCase.key} className={styles.caseCard}>
          <div className={styles.caseHeader}>
            <span className={styles.caseNumber}>#{index + 1}</span>
            <Badge color={testCase.isExample ? 'blue' : 'elephant'} variant="weak" size="small">
              {testCase.isExample ? '예시' : '숨은'}
            </Badge>
            <label className={styles.exampleToggle}>
              <Checkbox.Line
                size={18}
                checked={testCase.isExample}
                onCheckedChange={(isExample) => update(index, { isExample })}
              />
              예시
            </label>
            {testCase.run && <RunStatus run={testCase.run} />}
            <span className={styles.pushRight} />
            <Button
              color="light"
              variant="weak"
              size="small"
              disabled={index === 0}
              aria-label={`${index + 1}번 케이스를 위로`}
              onClick={() => onChange(move(cases, index, index - 1))}
            >
              ↑
            </Button>
            <Button
              color="light"
              variant="weak"
              size="small"
              disabled={index === cases.length - 1}
              aria-label={`${index + 1}번 케이스를 아래로`}
              onClick={() => onChange(move(cases, index, index + 1))}
            >
              ↓
            </Button>
            <Button color="danger" variant="weak" size="small" onClick={() => remove(index)}>
              지우기
            </Button>
          </div>

          <div className={styles.caseIO}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>입력</span>
              <textarea
                className={`${shared.input} ${styles.caseText}`}
                value={testCase.input}
                onChange={(event) => update(index, { input: event.target.value, run: null })}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>기대 출력</span>
              <textarea
                className={`${shared.input} ${styles.caseText}`}
                value={testCase.output}
                onChange={(event) => update(index, { output: event.target.value })}
              />
            </label>
          </div>

          {/* 실패한 실행은 까닭을 보여준다 — 출력칸은 그대로 두었으니 왜 안 채워졌는지 알아야 한다. */}
          {testCase.run && testCase.run.status !== 'ok' && (
            <pre className={styles.runOutput}>{testCase.run.stderr || testCase.run.stdout || '(출력 없음)'}</pre>
          )}
        </div>
      ))}

      <div>
        <Button
          color="primary"
          variant="weak"
          size="small"
          disabled={!canAdd}
          onClick={() => onChange([...cases, emptyCase(false)])}
        >
          {canAdd ? '케이스 추가' : `케이스는 ${MAXIMUM_CASE_COUNT}개까지`}
        </Button>
      </div>
    </div>
  )
}
