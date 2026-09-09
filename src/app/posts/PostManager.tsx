'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useToast } from '@/shared'
import type { Post } from '@/lib/collector'
import { SiteImage } from '@/components/SiteImage'
import { togglePostHidden, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'
import * as list from './postList.css'

/** 처음 그리는 글 수. 스크롤이 끝에 닿을 때마다 이만큼씩 잇는다. */
const PAGE_SIZE = 10

/**
 * 목록 끝에서 이만큼 남았을 때 미리 다음 장을 부른다.
 * 0으로 두면 눈금이 화면에 들어온 뒤에야 그리기 시작해 스크롤이 한 번 걸린다.
 */
const PREFETCH_MARGIN = '600px'

export function PostManager({ posts }: { posts: Post[] }) {
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [, startTransition] = useTransition()
  const { openToast } = useToast()
  /** 실패만 화면에 남긴다. 숨김을 바꿨다는 말은 스위치가 이미 보여주므로 토스트로 흘려보낸다. */
  const [failure, setFailure] = useState<ActionResult | null>(null)
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
  const hasMore = visibleCount < matched.length

  const sentinelRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    // 더 이을 것이 없으면 눈금을 그리지 않으므로 관찰할 대상도 없다.
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        // 남은 것보다 많이 세지 않는다 — 넘겨 세면 "다 봤는지" 판단이 어긋난다.
        setVisibleCount((count) => Math.min(count + PAGE_SIZE, matched.length))
      },
      { rootMargin: PREFETCH_MARGIN },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, matched.length])

  /** 갈래를 바꾸면 목록이 통째로 달라진다 — 앞의 스크롤 위치만큼 그려 둘 이유가 없다. */
  function selectTab(hiddenOnly: boolean) {
    setShowHiddenOnly(hiddenOnly)
    setVisibleCount(PAGE_SIZE)
  }

  function toggle(post: Post) {
    const nextHidden = !isHidden(post)
    setJustToggled((previous) => new Map(previous).set(post.id, nextHidden))

    startTransition(async () => {
      const outcome = await togglePostHidden(post.id, nextHidden)
      // 실패를 삼키면 눌렀는데 아무 일도 안 일어난 것처럼 보인다.
      if (outcome.ok) {
        setFailure(null)
        openToast(outcome.message)
      } else {
        setFailure(outcome)
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
      {failure && <p className={styles.errorNotice}>{failure.message}</p>}

      {/* 갈래 줄. 칠하지 않고 색·굵기로만 고른 것을 표시한다 — 앱인토스 블로그와 같은 방식이다. */}
      <div className={list.tabs}>
        <button
          type="button"
          className={`${list.tab} ${showHiddenOnly ? '' : list.tabActive}`}
          onClick={() => selectTab(false)}
        >
          전체
        </button>
        <button
          type="button"
          className={`${list.tab} ${showHiddenOnly ? list.tabActive : ''}`}
          onClick={() => selectTab(true)}
        >
          숨긴 글만
        </button>
      </div>

      <div className={styles.card}>
        <div className={list.list}>
          {visible.map((post) => (
            <article key={post.id} className={`${list.row} ${isHidden(post) ? list.rowHidden : ''}`}>
              <SiteImage className={list.thumbnail} thumbnail={post.sourceThumbnail} />

              <div className={list.rowText}>
                <p className={list.blogName}>{post.blogName}</p>
                {/*
                  원문이 아니라 우리 미리보기로 간다 — 어드민에서 알고 싶은 것은
                  "우리 사이트에 어떻게 나갔나"다. 원문은 미리보기 화면에 링크로 있다.
                */}
                <a className={list.title} href={`/posts/${post.id}`}>
                  {post.title}
                </a>
                <p className={list.meta}>
                  <span>{new Date(post.publishedAt).toLocaleDateString('ko-KR')}</span>
                  {/*
                    한 번도 읽히지 않은 글에는 아무것도 적지 않는다 — "0회"라고 쓰면
                    아직 집계를 안 붙인 것인지 정말 안 읽힌 것인지 구분되지 않는다.
                  */}
                  {post.totalViews > 0 && (
                    <span className={list.views} title={`누적 ${post.totalViews.toLocaleString()}회`}>
                      최근 7일 {post.recentViews.toLocaleString()}회
                    </span>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!isHidden(post)}
                    aria-label={`${post.title} 공개`}
                    title={isHidden(post) ? '숨김 — 누르면 공개합니다' : '공개 중 — 누르면 숨깁니다'}
                    className={`${list.spacer} ${styles.toggleTrack} ${isHidden(post) ? '' : styles.toggleTrackOn}`}
                    onClick={() => toggle(post)}
                  >
                    <span className={`${styles.toggleKnob} ${isHidden(post) ? '' : styles.toggleKnobOn}`} />
                  </button>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/*
        관찰 대상이 곧 안내 문구다. 눈에 보이지 않는 1px 눈금을 따로 두면 넓이가 0이라
        브라우저가 "화면에 들어왔다"고 보지 않아 아무리 내려도 다음 장이 붙지 않는다.
      */}
      {hasMore && (
        <p ref={sentinelRef} className={list.loadingNotice}>
          {matched.length - visibleCount}개 더 불러오는 중…
        </p>
      )}
    </>
  )
}
