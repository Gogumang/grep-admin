'use client'

import {
  FORMAT_LABELS,
  STAGE_TYPE_LABELS,
  type InterviewFormat,
  type InterviewStageType,
} from '@/lib/interviews'
import { Button, FilterSelect } from '@/shared'
import * as shared from '@/components/shared.css'
import { emptyQuestion, type QuestionDraft, type StageDraft } from './interviewDraft'
import * as styles from './interviews.css'

const STAGE_TYPE_OPTIONS = Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const FORMAT_OPTIONS = Object.entries(FORMAT_LABELS).map(([value, label]) => ({ value, label }))

interface StageEditorProps {
  stage: StageDraft
  stageNumber: number
  isFirst: boolean
  isLast: boolean
  onChange: (stage: StageDraft) => void
  onMove: (offset: -1 | 1) => void
  onRemove: () => void
}

/** 전형 단계 하나. 형식·소요 시간은 원문에 없으면 비워 둔다 — 추측으로 채우면 집계가 틀어진다. */
export function StageEditor({ stage, stageNumber, isFirst, isLast, onChange, onMove, onRemove }: StageEditorProps) {
  function patch(next: Partial<StageDraft>) {
    onChange({ ...stage, ...next })
  }

  function patchQuestion(key: string, next: Partial<QuestionDraft>) {
    patch({ questions: stage.questions.map((question) => (question.key === key ? { ...question, ...next } : question)) })
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {stageNumber}단계 · {STAGE_TYPE_LABELS[stage.type]}
        </h2>
        <span className={styles.pushRight} />
        <Button color="dark" variant="weak" size="small" disabled={isFirst} onClick={() => onMove(-1)}>
          위로
        </Button>
        <Button color="dark" variant="weak" size="small" disabled={isLast} onClick={() => onMove(1)}>
          아래로
        </Button>
        <Button color="danger" variant="weak" size="small" onClick={onRemove}>
          단계 삭제
        </Button>
      </div>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>단계</span>
          <FilterSelect
            label="단계"
            options={STAGE_TYPE_OPTIONS}
            value={stage.type}
            hasAllOption={false}
            onChange={(type) => type && patch({ type: type as InterviewStageType })}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>형식 (모르면 비움)</span>
          <FilterSelect
            label="형식"
            options={FORMAT_OPTIONS}
            value={stage.format}
            onChange={(format) => patch({ format: format as InterviewFormat | null })}
          />
        </div>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>소요 시간 (분)</span>
          <input
            className={shared.input}
            inputMode="numeric"
            placeholder="60"
            value={stage.durationMinutes}
            onChange={(event) => patch({ durationMinutes: event.target.value })}
          />
        </label>
      </div>

      <label className={styles.wideField}>
        <span className={styles.fieldLabel}>단계 메모 (진행 방식·분위기 등)</span>
        <textarea
          className={`${shared.input} ${styles.textArea}`}
          value={stage.note}
          onChange={(event) => patch({ note: event.target.value })}
        />
      </label>

      <div className={styles.questionList}>
        {stage.questions.map((question, index) => (
          <div key={question.key} className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>질문 {index + 1}</span>
              <span className={styles.pushRight} />
              <Button
                color="danger"
                variant="weak"
                size="small"
                onClick={() => patch({ questions: stage.questions.filter((each) => each.key !== question.key) })}
              >
                삭제
              </Button>
            </div>
            <textarea
              className={`${shared.input} ${styles.textArea}`}
              aria-label={`질문 ${index + 1}`}
              placeholder="트랜잭션 격리 수준을 설명해 주세요"
              value={question.question}
              onChange={(event) => patchQuestion(question.key, { question: event.target.value })}
            />
            <div className={styles.questionFields}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>꼬리질문 (한 줄에 하나)</span>
                <textarea
                  className={`${shared.input} ${styles.textArea}`}
                  value={question.followUps}
                  onChange={(event) => patchQuestion(question.key, { followUps: event.target.value })}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>주제 (쉼표로 구분)</span>
                <input
                  className={shared.input}
                  placeholder="DB, 트랜잭션"
                  value={question.topics}
                  onChange={(event) => patchQuestion(question.key, { topics: event.target.value })}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.addRow}>
        <Button
          color="primary"
          variant="weak"
          size="small"
          onClick={() => patch({ questions: [...stage.questions, emptyQuestion()] })}
        >
          질문 추가
        </Button>
      </div>
    </section>
  )
}
