'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Loader, Stepper, StepperRow } from '@/shared'
import * as dialogStyles from '@/shared/overlay/Dialog.css'
import type { EventCollectionSnapshot, EventCollectionStep } from '@/lib/collector'
import * as collectStyles from '../blogs/CollectRunner.css'
import { refreshEvents, type ActionResult } from './actions'
import * as styles from './RefreshEventsModal.css'

const POLL_INTERVAL_MILLISECONDS = 1_000
/** 판매처가 다섯 곳이라 TDS 기본 간격(0.1초)이면 창이 늦게 찬다. 블로그·채용 수집 화면과 같게 줄인다. */
const ROW_STAGGER_SECONDS = 0.03
/** 판매처가 아닌 단계. collector EventCollectionProgress 의 key 다. */
const STAGE_KEYS = new Set(['pending', 'images', 'site'])

async function readProgress(): Promise<EventCollectionSnapshot | null> {
  const response = await fetch('/events/collect-progress', { cache: 'no-store' })
  if (!response.ok) return null
  return (await response.json()) as EventCollectionSnapshot | null
}

function StatusMark({ state }: { state: EventCollectionStep['state'] }) {
  if (state === 'RUNNING') return <Loader size="small" label="진행 중" />
  if (state === 'DONE') return <span className={collectStyles.markDone}>✓</span>
  if (state === 'FAILED') return <span className={collectStyles.markFailed}>✕</span>
  if (state === 'SKIPPED') return <span className={styles.skipped}>건너뜀</span>
  return null
}

/** 판매처는 수집처 아이콘, 뒤 단계는 이름 첫 글자. 아이콘을 못 불러오면 판매처도 첫 글자로 물러난다. */
function StepIcon({ step }: { step: EventCollectionStep }) {
  const [hasFailed, setHasFailed] = useState(false)
  if (STAGE_KEYS.has(step.key) || hasFailed) return <span className={collectStyles.saveIcon}>{step.label.slice(0, 1)}</span>
  return (
    <img
      className={styles.sourceIcon}
      src={`/event-source-icons/${encodeURIComponent(step.key)}.png`}
      alt=""
      onError={() => setHasFailed(true)}
    />
  )
}

function describe(step: EventCollectionStep): string {
  if (step.state === 'RUNNING') return step.key === 'site' ? '반영하는 중…' : STAGE_KEYS.has(step.key) ? '하는 중…' : '읽는 중…'
  return step.message ?? '대기'
}

/**
 * 판매처를 지금 다시 읽는 버튼. 누르면 창을 띄워 판매처마다, 그 뒤 대기 쌓기·이미지 찾기·사이트 반영까지
 * 어디까지 왔는지 Stepper 로 보여 준다 — 한 번에 1~2분 걸려 결과만 기다리면 그동안 아무것도 보이지 않는다.
 *
 * 채용 수집처럼 판매처마다 따로 부르지 않는다. 여러 판매처의 같은 행사를 한 번에 모아 거르므로 수집은 한 번에 돌고,
 * 진행은 collector 가 남기는 것을 1초마다 읽는다. 창에 남은 결과는 사람이 닫을 때까지 둔다 — 실패 이유는 읽고 넘어가야 하는 말이다.
 */
export function RefreshEventsButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [snapshot, setSnapshot] = useState<EventCollectionSnapshot | null>(null)
  const [outcome, setOutcome] = useState<ActionResult | null>(null)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (pollTimer.current) clearInterval(pollTimer.current) }, [])

  async function run() {
    setIsOpen(true)
    setIsRunning(true)
    setSnapshot(null)
    setOutcome(null)

    // 누르기 전 마지막 수집(매일 08:30 것 등)을 이번 것으로 잘못 그리지 않게 시작 시각으로 가른다.
    const previousStartedAt = (await readProgress().catch(() => null))?.startedAt
    const showIfCurrent = (found: EventCollectionSnapshot | null) => {
      if (found && found.startedAt !== previousStartedAt) setSnapshot(found)
    }
    pollTimer.current = setInterval(() => {
      readProgress().then(showIfCurrent).catch(() => {})
    }, POLL_INTERVAL_MILLISECONDS)

    const result = await refreshEvents()
    if (pollTimer.current) clearInterval(pollTimer.current)
    pollTimer.current = null
    showIfCurrent(await readProgress().catch(() => null))
    setOutcome(result)
    setIsRunning(false)
    router.refresh()
  }

  // 도는 동안 Esc 로 닫지 않는다 — 창이 사라지면 결과를 알 길이 없다.
  useEffect(() => {
    if (!isOpen || isRunning) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setIsOpen(false)
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [isOpen, isRunning])

  const steps = snapshot?.steps ?? []
  const finishedCount = steps.filter((step) => step.state !== 'WAITING' && step.state !== 'RUNNING').length
  const progress = steps.length === 0 ? 0 : Math.round((finishedCount / steps.length) * 100)
  const failedCount = steps.filter((step) => step.state === 'FAILED').length

  return (
    <>
      <Button color="primary" variant="weak" size="small" disabled={isRunning} onClick={run}>
        {isRunning ? '판매처에서 가져오는 중…' : '판매처에서 다시 가져오기'}
      </Button>

      {isOpen &&
        createPortal(
          <div
            className={dialogStyles.dimmer}
            onClick={(event) => event.target === event.currentTarget && !isRunning && setIsOpen(false)}
          >
            <div className={`${dialogStyles.dialog} ${styles.dialog}`} role="dialog" aria-modal="true" aria-labelledby="refresh-events-title">
              <h2 id="refresh-events-title" className={dialogStyles.title}>
                {isRunning ? '판매처에서 가져오는 중' : '가져오기를 마쳤어요'}
              </h2>

              <div className={collectStyles.progressBar}>
                <div className={collectStyles.progressFill} style={{ width: `${isRunning ? progress : 100}%` }} />
              </div>
              <p className={styles.summary}>
                {steps.length === 0
                  ? '수집을 시작하는 중…'
                  : `${finishedCount}/${steps.length}단계${failedCount > 0 ? ` · 실패 ${failedCount}곳` : ''}`}
              </p>

              {steps.length === 0 ? (
                isRunning && <Loader size="small" label="시작하는 중" />
              ) : (
                <Stepper staggerDelay={ROW_STAGGER_SECONDS}>
                  {steps.map((step, index) => (
                    <StepperRow
                      key={step.key}
                      left={<StepperRow.AssetFrame content={<StepIcon step={step} />} />}
                      center={<StepperRow.Texts type="C" title={step.label} description={describe(step)} />}
                      right={<StatusMark state={step.state} />}
                      hideLine={index === steps.length - 1}
                    />
                  ))}
                </Stepper>
              )}

              {outcome && (
                <p className={outcome.ok ? dialogStyles.description : styles.outcomeFailed}>
                  {outcome.ok ? outcome.message : `갱신하지 못했습니다: ${outcome.message}`}
                </p>
              )}

              <div className={dialogStyles.buttons}>
                <Button color="primary" size="medium" display="full" disabled={isRunning} onClick={() => setIsOpen(false)}>
                  {isRunning ? '가져오는 중…' : '닫기'}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
