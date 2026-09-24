'use client'

import { useState, type ReactNode } from 'react'
import { Button, Loader, Stepper, StepperRow, useToast } from '@/shared'
import { collectOneFeed, commitCollection, startCollection, type FeedResult } from './actions'
import * as styles from './CollectRunner.css'
import * as shared from '@/components/shared.css'

type Phase = 'idle' | 'collecting' | 'committing' | 'done'
type StepState = 'waiting' | 'running' | 'done' | 'failed'

/**
 * 단계 왼쪽 표시. 기다리는 단계는 번호, 도는 단계는 스피너, 끝난 단계는 체크, 실패는 ✕다 —
 * 번호만 두면 지금 어디까지 왔는지 설명을 읽어야 안다.
 */
function StepMark({ number, state }: { number: 1 | 2 | 3; state: StepState }) {
  if (state === 'running') return <StepperRow.AssetFrame content={<Loader size="small" label={`${number}단계 진행 중`} />} />
  if (state === 'done') return <StepperRow.AssetFrame content={<span className={styles.markDone}>✓</span>} />
  if (state === 'failed') return <StepperRow.AssetFrame content={<span className={styles.markFailed}>✕</span>} />
  return <StepperRow.NumberIcon number={number} />
}

export function CollectRunner() {
  const { openToast } = useToast()
  const [phase, setPhase] = useState<Phase>('idle')
  const [totalBlogCount, setTotalBlogCount] = useState(0)
  const [results, setResults] = useState<FeedResult[]>([])
  /** 저장 단계의 결과. 실패도 단계 안에 남긴다 — 토스트는 3초 뒤 사라져 무엇이 잘못됐는지 다시 볼 수 없다. */
  const [commitOutcome, setCommitOutcome] = useState<{ ok: boolean; message: string } | null>(null)
  /** 시작부터 막힌 경우. 단계가 하나도 돌지 않았으니 단계 밖에 띄운다. */
  const [startError, setStartError] = useState<string | null>(null)

  async function run() {
    setPhase('collecting')
    setTotalBlogCount(0)
    setResults([])
    setCommitOutcome(null)
    setStartError(null)

    let start: Awaited<ReturnType<typeof startCollection>>
    try {
      start = await startCollection()
    } catch (caught) {
      setPhase('idle')
      setStartError((caught as Error).message)
      return
    }

    setTotalBlogCount(start.blogs.length)

    // 블로그를 하나씩 순서대로 돈다. 한꺼번에 던지면 상대 서버에 무례하고,
    // 어디서 막혔는지도 보이지 않는다.
    for (const blog of start.blogs) {
      const result = await collectOneFeed(start.runId, blog.blogKey, blog.blogName)
      setResults((previous) => [...previous, result])
    }

    setPhase('committing')
    const commit = await commitCollection(start.runId)
    setCommitOutcome(commit)
    if (commit.ok) openToast(commit.message)
    setPhase('done')
  }

  const isRunning = phase === 'collecting' || phase === 'committing'
  const hasBlogList = totalBlogCount > 0
  const progress = totalBlogCount === 0 ? 0 : Math.round((results.length / totalBlogCount) * 100)
  const newPostCount = results.reduce((sum, result) => sum + result.newPostCount, 0)
  const failures = results.filter((result) => !result.ok)
  const blogsWithNewPosts = results.filter((result) => result.ok && result.newPostCount > 0)

  const listState: StepState = hasBlogList ? 'done' : 'running'
  const collectState: StepState = !hasBlogList ? 'waiting' : phase === 'collecting' ? 'running' : 'done'
  const commitState: StepState =
    phase === 'committing' ? 'running' : commitOutcome ? (commitOutcome.ok ? 'done' : 'failed') : 'waiting'

  let collectDescription: ReactNode = '블로그를 하나씩 돌며 새 글을 모읍니다.'
  if (hasBlogList) {
    collectDescription = (
      <>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.summary}>
          {results.length}/{totalBlogCount} · 새 글 {newPostCount}개 · 실패 {failures.length}곳
        </p>
        {blogsWithNewPosts.length > 0 && (
          <p className={styles.summary}>
            {blogsWithNewPosts.map((result) => `${result.blogName} ${result.newPostCount}`).join(' · ')}
          </p>
        )}
        {/* 실패는 이유까지 남긴다 — 무엇을 고쳐야 하는지는 이유에 있다. */}
        {failures.length > 0 && (
          <ul className={styles.failureList}>
            {failures.map((result) => (
              <li key={result.blogKey}>
                <span className={styles.failureName}>{result.blogName}</span> {result.message}
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  let commitDescription = '모은 글을 한 번에 저장합니다.'
  if (phase === 'committing') {
    commitDescription = '글마다 썸네일을 그리고 원문 본문을 받아옵니다. 새 글이 많으면 몇 분 걸릴 수 있습니다.'
  } else if (commitOutcome) {
    commitDescription = commitOutcome.message
  }

  return (
    <>
      <div className={shared.formRow}>
        <Button color="primary" variant="weak" size="small" onClick={run} disabled={isRunning}>
          {isRunning ? '수집 중…' : '수집 실행'}
        </Button>
      </div>

      {startError && <p className={shared.errorNotice}>{startError}</p>}

      {phase !== 'idle' && (
        <div className={`${shared.card} ${styles.stepperCard}`}>
          <Stepper>
            <StepperRow
              left={<StepMark number={1} state={listState} />}
              center={
                <StepperRow.Texts
                  type="A"
                  title="블로그 목록 받기"
                  description={hasBlogList ? `수집을 켜 둔 블로그 ${totalBlogCount}곳` : '수집할 블로그를 불러옵니다.'}
                />
              }
            />
            <StepperRow
              left={<StepMark number={2} state={collectState} />}
              center={<StepperRow.Texts type="A" title="블로그마다 새 글 모으기" description={collectDescription} />}
            />
            <StepperRow
              left={<StepMark number={3} state={commitState} />}
              center={<StepperRow.Texts type="A" title="한 번에 저장하기" description={commitDescription} />}
              hideLine
            />
          </Stepper>
        </div>
      )}
    </>
  )
}
