'use client'

import { useState } from 'react'
import { Button, Loader, Stepper, StepperRow, useToast } from '@/shared'
import { BlogIcon } from '@/components/BlogIcon'
import { collectOneFeed, commitCollection, startCollection, type FeedResult } from './actions'
import * as styles from './CollectRunner.css'
import * as shared from '@/components/shared.css'

export type Phase = 'idle' | 'listing' | 'collecting' | 'committing' | 'done'

export interface CommitOutcome {
  ok: boolean
  message: string
}

export interface Blog {
  blogKey: string
  blogName: string
}

/** 줄 왼쪽 회사 아이콘. Stepper 번호 원과 같은 24px이다. */
const BLOG_ICON_SIZE = 24

/**
 * 블로그가 20곳을 넘어서 TDS 기본 간격(0.1초)이면 마지막 줄이 2초 넘게 늦게 뜬다.
 * 목록이 한꺼번에 떠오르는 느낌만 남기고 줄인다.
 */
const ROW_STAGGER_SECONDS = 0.03

type RowState = 'waiting' | 'running' | 'done' | 'failed'

function stateOf(outcome: { ok: boolean } | null | undefined, isRunning: boolean): RowState {
  if (isRunning) return 'running'
  if (!outcome) return 'waiting'
  return outcome.ok ? 'done' : 'failed'
}

/** 오른쪽 상태 표시. 도는 중은 스피너, 끝나면 ✓, 실패는 ✕, 차례를 기다리면 비운다. */
function StatusMark({ state }: { state: RowState }) {
  if (state === 'running') return <Loader size="small" label="진행 중" />
  if (state === 'done') return <span className={styles.markDone}>✓</span>
  if (state === 'failed') return <span className={styles.markFailed}>✕</span>
  return null
}

/** 저장 줄 왼쪽 그림. 블로그 줄과 달리 회사가 없어서 내려받기 모양을 둔다. */
function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function describe(result: FeedResult | undefined, isRunning: boolean): string {
  if (isRunning) return '수집 중…'
  if (!result) return '대기'
  if (!result.ok) return result.message
  const newPosts = result.newPostCount > 0 ? `새 글 ${result.newPostCount}개` : '새 글 없음'
  return result.message ? `${newPosts} (${result.message})` : newPosts
}

export function CollectRunner() {
  const { openToast } = useToast()
  const [phase, setPhase] = useState<Phase>('idle')
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [results, setResults] = useState<FeedResult[]>([])
  /** 저장 단계의 결과. 실패도 줄 안에 남긴다 — 토스트는 3초 뒤 사라져 무엇이 잘못됐는지 다시 볼 수 없다. */
  const [commitOutcome, setCommitOutcome] = useState<CommitOutcome | null>(null)
  /** 시작부터 막힌 경우. 돌린 블로그가 없으니 목록 밖에 띄운다. */
  const [startError, setStartError] = useState<string | null>(null)

  async function run() {
    setPhase('listing')
    setBlogs([])
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

    setBlogs(start.blogs)
    setPhase('collecting')

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

  const isBusy = phase === 'listing' || phase === 'collecting' || phase === 'committing'

  return (
    <>
      <div className={shared.formRow}>
        <Button color="primary" variant="weak" size="small" onClick={run} disabled={isBusy}>
          {isBusy ? '수집 중…' : '수집 실행'}
        </Button>
      </div>

      {startError && <p className={shared.errorNotice}>{startError}</p>}

      {phase === 'listing' && (
        <p className={shared.mutedText}>
          <Loader size="small" label="블로그 목록을 불러오는 중" /> 수집할 블로그를 불러오는 중…
        </p>
      )}

      {blogs.length > 0 && (
        <CollectProgress phase={phase} blogs={blogs} results={results} commitOutcome={commitOutcome} />
      )}
    </>
  )
}

/**
 * 블로그마다 한 줄씩 — 어느 회사를 지금 돌고 있는지, 어디서 새 글이 나왔고 어디가 실패했는지를
 * 한눈에 보려고 Stepper를 쓴다. 상태는 CollectRunner가 들고 여기는 그리기만 한다.
 */
export function CollectProgress({
  phase,
  blogs,
  results,
  commitOutcome,
}: {
  phase: Phase
  blogs: Blog[]
  results: FeedResult[]
  commitOutcome: CommitOutcome | null
}) {
  const resultByBlog = new Map(results.map((result) => [result.blogKey, result]))
  // 순서대로 돌기 때문에 지금 도는 블로그는 결과가 쌓인 수 바로 다음 자리다.
  const runningBlogKey = phase === 'collecting' ? blogs[results.length]?.blogKey : undefined
  const progress = blogs.length === 0 ? 0 : Math.round((results.length / blogs.length) * 100)
  const newPostCount = results.reduce((sum, result) => sum + result.newPostCount, 0)
  const failedCount = results.filter((result) => !result.ok).length

  let commitDescription = '블로그를 다 돌면 모은 글을 한 번에 저장합니다.'
  if (phase === 'committing') {
    commitDescription = '글마다 썸네일을 그리고 원문 본문을 받아옵니다. 새 글이 많으면 몇 분 걸릴 수 있습니다.'
  } else if (commitOutcome) {
    commitDescription = commitOutcome.message
  }

  return (
    <>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={shared.mutedText} style={{ marginBottom: 12 }}>
        {results.length}/{blogs.length} · 새 글 {newPostCount}개 · 실패 {failedCount}곳
      </p>

      <div className={`${shared.card} ${styles.stepperCard}`}>
        <Stepper staggerDelay={ROW_STAGGER_SECONDS}>
          {blogs.map((blog) => {
            const isRunning = blog.blogKey === runningBlogKey
            const result = resultByBlog.get(blog.blogKey)
            return (
              <StepperRow
                key={blog.blogKey}
                left={<StepperRow.AssetFrame content={<BlogIcon blogKey={blog.blogKey} size={BLOG_ICON_SIZE} />} />}
                center={
                  <StepperRow.Texts type="C" title={blog.blogName} description={describe(result, isRunning)} />
                }
                right={<StatusMark state={stateOf(result, isRunning)} />}
              />
            )
          })}
          <StepperRow
            key="commit"
            left={<StepperRow.AssetFrame content={<span className={styles.saveIcon}><SaveIcon /></span>} />}
            center={<StepperRow.Texts type="C" title="한 번에 저장하기" description={commitDescription} />}
            right={<StatusMark state={stateOf(commitOutcome, phase === 'committing')} />}
            hideLine
          />
        </Stepper>
      </div>
    </>
  )
}
