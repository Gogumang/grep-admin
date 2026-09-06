'use client'

import { useMemo, useState, useTransition } from 'react'
import type { Post } from '@/lib/collector'
import { toSiteImageUrl } from '@/lib/site'
import { togglePostHidden, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'
import * as list from './postList.css'

/** 한 번에 그리는 글 수. 667개를 한 화면에 늘어놓으면 브라우저가 버벅인다. */
const PAGE_SIZE = 40

export function PostManager({ posts }: { posts: Post[] }) {
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  /**
   * 방금 누른 스위치의 상태.
   *
   * 서버 왕복(collector → 저장소 커밋 → 재검증)이 끝날 때까지 스위치가 제자리에 있으면
   * 눌리지 않은 것처럼 보인다. 눌린 즉시 여기에 적어 두고, 실패하면 지워서
   * 서버가 아는 상태로 되돌린다 — 실패를 삼키고 켜진 채 두면 거짓말이 된다.
   */
  const [justToggled, setJustToggled] = useState<Map<string, boolean>>(new Map())

  /** 화면이 믿을 상태. 방금 누른 값이 있으면 그것이, 없으면 서버가 준 값이 이긴다. */
  const isHidden = (post: Post) => justToggled.get(post.id) ?? post.hidden

  const matched = useMemo(
    () => (showHiddenOnly ? posts.filter((post) => justToggled.get(post.id) ?? post.hidden) : posts),
    [posts, showHiddenOnly, justToggled],
  )

  const visible = matched.slice(0, visibleCount)

  function toggle(post: Post) {
    const nextHidden = !isHidden(post)
    setJustToggled((previous) => new Map(previous).set(post.id, nextHidden))

    startTransition(async () => {
      const outcome = await togglePostHidden(post.id, nextHidden)
      // 실패를 삼키면 눌렀는데 아무 일도 안 일어난 것처럼 보인다.
      setResult(outcome)
      if (!outcome.ok) {
        setJustToggled((previous) => {
          const next = new Map(previous)
          next.delete(post.id)
          return next
        })
      }
    })
  }

  return (
    <>
      {result && <p className={result.ok ? styles.notice : styles.errorNotice}>{result.message}</p>}

      {/* 갈래 줄. 칠하지 않고 색·굵기로만 고른 것을 표시한다 — 앱인토스 블로그와 같은 방식이다. */}
      <div className={list.tabs}>
        <button
          type="button"
          className={`${list.tab} ${showHiddenOnly ? '' : list.tabActive}`}
          onClick={() => setShowHiddenOnly(false)}
        >
          전체
        </button>
        <button
          type="button"
          className={`${list.tab} ${showHiddenOnly ? list.tabActive : ''}`}
          onClick={() => setShowHiddenOnly(true)}
        >
          숨긴 글만
        </button>
      </div>

      <div className={styles.card}>
        <div className={list.list}>
          {visible.map((post) => {
            const thumbnail = toSiteImageUrl(post.sourceThumbnail)
            return (
            <article key={post.id} className={`${list.row} ${isHidden(post) ? list.rowHidden : ''}`}>
              <div className={list.rowText}>
                <p className={list.blogName}>{post.blogName}</p>
                <a className={list.title} href={post.url} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </a>
                <p className={list.meta}>
                  <span>{new Date(post.publishedAt).toLocaleDateString('ko-KR')}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!isHidden(post)}
                    aria-label={`${post.title} 공개`}
                    title={isHidden(post) ? '숨김 — 누르면 공개합니다' : '공개 중 — 누르면 숨깁니다'}
                    className={`${styles.toggleTrack} ${isHidden(post) ? '' : styles.toggleTrackOn}`}
                    onClick={() => toggle(post)}
                  >
                    <span className={`${styles.toggleKnob} ${isHidden(post) ? '' : styles.toggleKnobOn}`} />
                  </button>
                </p>
              </div>

              {thumbnail ? (
                <img className={list.thumbnail} src={thumbnail} alt="" />
              ) : (
                <div className={list.thumbnail} />
              )}
            </article>
            )
          })}
        </div>
      </div>

      {visibleCount < matched.length && (
        <button
          type="button"
          className={styles.quietButton}
          style={{ width: '100%', marginTop: 20 }}
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          {matched.length - visibleCount}개 더 보기
        </button>
      )}
    </>
  )
}
