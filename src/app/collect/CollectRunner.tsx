'use client'

import { useState } from 'react'
import { Button, useToast } from '@/shared'
import { collectOneFeed, commitCollection, startCollection, type FeedResult } from './actions'
import * as styles from './CollectRunner.css'
import * as shared from '@/components/shared.css'

type Phase = 'idle' | 'collecting' | 'committing' | 'done'

export function CollectRunner() {
  const { openToast } = useToast()
  const [phase, setPhase] = useState<Phase>('idle')
  const [totalBlogCount, setTotalBlogCount] = useState(0)
  const [results, setResults] = useState<FeedResult[]>([])
  /** 실패했을 때만 채운다. 성공은 토스트로 지나가고 화면에 남기지 않는다. */
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setPhase('collecting')
    setResults([])
    setError(null)

    let start: Awaited<ReturnType<typeof startCollection>>
    try {
      start = await startCollection()
    } catch (caught) {
      setPhase('idle')
      // 실패는 토스트로 띄우지 않는다 — 3초 뒤 사라지면 무엇이 잘못됐는지 다시 볼 수 없다.
      setError((caught as Error).message)
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
    // 끝났다는 소식은 스쳐 지나가도 되는 말이라 토스트로 띄운다. 실패는 화면에 남긴다.
    if (commit.ok) openToast(commit.message)
    else setError(commit.message)
    setPhase('done')
  }

  const isRunning = phase === 'collecting' || phase === 'committing'
  const progress = totalBlogCount === 0 ? 0 : Math.round((results.length / totalBlogCount) * 100)
  const newPostCount = results.reduce((sum, result) => sum + result.newPostCount, 0)
  const failedCount = results.filter((result) => !result.ok).length

  return (
    <>
      <div className={shared.formRow}>
        {/*
          * loading을 쓰지 않는다 — 스피너가 글자를 대신하면 "3/12"라는 진행 상황이 사라진다.
          * 도는 그림보다 몇 개째인지가 더 쓸모 있다.
          */}
        <Button color="primary" variant="weak" size="small" onClick={run} disabled={isRunning}>
          {phase === 'collecting' && `수집 중… ${results.length}/${totalBlogCount}`}
          {phase === 'committing' && '저장 중…'}
          {!isRunning && '수집 실행'}
        </Button>
      </div>

      {phase === 'committing' && (
        <p className={shared.notice}>
          글마다 썸네일을 그리고 원문 본문을 받아옵니다. 새 글이 많으면 몇 분 걸릴 수 있습니다.
        </p>
      )}

      {error && <p className={shared.errorNotice}>{error}</p>}

      {results.length > 0 && (
        <>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>

          <p className={shared.mutedText} style={{ marginBottom: 12 }}>
            새 글 {newPostCount}개 · 성공 {results.length - failedCount} / 실패 {failedCount}
          </p>

          <div className={shared.card}>
          <ul className={styles.log}>
            {results.map((result) => (
              <li key={result.blogKey} className={styles.logRow}>
                <span className={result.ok ? styles.markOk : styles.markFailed}>{result.ok ? '✓' : '✗'}</span>
                <span className={styles.blogName}>{result.blogName}</span>
                <span className={styles.detail}>
                  {result.ok ? `새 글 ${result.newPostCount}${result.message ? ` (${result.message})` : ''}` : result.message}
                </span>
              </li>
            ))}
          </ul>
          </div>
        </>
      )}
    </>
  )
}
