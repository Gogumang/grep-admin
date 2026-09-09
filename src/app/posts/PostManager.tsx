'use client'

import { useMemo, useState, useTransition } from 'react'
import { Button, useToast } from '@/shared'
import type { Post } from '@/lib/collector'
import { SiteImage } from '@/components/SiteImage'
import { togglePostHidden, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'
import * as list from './postList.css'

/** 한 번에 그리는 글 수. 667개를 한 화면에 늘어놓으면 브라우저가 버벅인다. */
const PAGE_SIZE = 40

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
          {visible.map((post) => (
            <article key={post.id} className={`${list.row} ${isHidden(post) ? list.rowHidden : ''}`}>
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
                    className={`${styles.toggleTrack} ${isHidden(post) ? '' : styles.toggleTrackOn}`}
                    onClick={() => toggle(post)}
                  >
                    <span className={`${styles.toggleKnob} ${isHidden(post) ? '' : styles.toggleKnobOn}`} />
                  </button>
                </p>
              </div>

              <SiteImage className={list.thumbnail} thumbnail={post.sourceThumbnail} />
            </article>
          ))}
        </div>
      </div>

      {visibleCount < matched.length && (
        <Button
          color="light"
          size="small"
          display="block"
          htmlStyle={{ marginTop: 20 }}
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          {matched.length - visibleCount}개 더 보기
        </Button>
      )}
    </>
  )
}
