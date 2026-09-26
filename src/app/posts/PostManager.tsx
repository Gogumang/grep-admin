'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { FilterSelect, Result, useToast } from '@/shared'
import type { Post } from '@/lib/collector'
import { SiteImage } from '@/components/SiteImage'
import { togglePostHidden, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'
import { POST_CATEGORY_OPTIONS } from '@/lib/postCategories'
import * as list from './postList.css'

/** 처음 그리는 글 수. 스크롤이 끝에 닿을 때마다 이만큼씩 잇는다. */
const PAGE_SIZE = 10

/**
 * 목록 끝에서 이만큼 남았을 때 미리 다음 장을 부른다.
 * 0으로 두면 눈금이 화면에 들어온 뒤에야 그리기 시작해 스크롤이 한 번 걸린다.
 */
const PREFETCH_MARGIN = '600px'

/**
 * 빈 목록 그림. TDS가 쓰는 static.toss.im/lotties/empty-2-spot-apng.png 를 받아 public 에 둔 것이다 —
 * 남의 CDN을 바로 부르면 그쪽이 주소를 바꾸는 날 어드민 그림이 깨진다. 움직이는 PNG(APNG)라 한 번 재생된다.
 */
const EMPTY_FIGURE = <img src="/illustrations/empty.png" alt="" width={100} height={100} />

/**
 * 목록이 실제로 그리는 것만 추린 글.
 *
 * Post 를 그대로 넘기면 이 화면이 한 번도 읽지 않는 summary·url·blogKey·tags 까지
 * 398건분이 브라우저로 실려 나간다 — 2026-09-10 실측으로 목록 데이터 160KB 중 72KB가
 * 그 몫이었다. 필드를 늘릴 일이 생기면 여기에 적으면 page.tsx 가 컴파일로 알려준다.
 *
 * 골라내는 일은 page.tsx(서버)가 한다. 여기서 매퍼를 export 하면 'use client' 모듈의
 * export 라 클라이언트 참조가 되어, 서버에서 부르는 순간 런타임에 터진다 — 타입 검사와
 * 빌드는 멀쩡히 통과하므로 화면을 열어 보기 전까지 드러나지 않는다.
 */
export interface PostListItem {
  id: string
  title: string
  blogName: string
  publishedAt: string
  sourceThumbnail: string | null
  hidden: boolean
  /** 분류. 아직 매기지 않은 글은 null 이고, 필터에서는 사이트처럼 Engineering 으로 본다. */
  category: string | null
  recentViews: number
  totalViews: number
}

/** 사이트는 분류가 없는 글을 Engineering 으로 보여 준다 — 어드민 필터도 같게 걸러야 둘을 대조할 수 있다. */
const UNCATEGORIZED_AS = 'Engineering'

export function PostManager({ posts }: { posts: PostListItem[] }) {
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)
  /** 고른 회사(블로그 이름). null이면 모든 회사. 숨김 갈래와 함께 걸린다. */
  const [blogName, setBlogName] = useState<string | null>(null)
  /** 고른 분류. null이면 모든 분류. 회사·숨김 갈래와 함께 걸린다. */
  const [category, setCategory] = useState<string | null>(null)
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
  const isHidden = (post: PostListItem) => justToggled.get(post.id) ?? post.hidden

  // 글이 많은 회사부터 둔다 — 자주 찾는 회사가 위에 온다.
  const blogNames = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts) counts.set(post.blogName, (counts.get(post.blogName) ?? 0) + 1)
    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'ko'))
      .map(([name]) => name)
  }, [posts])

  const matched = useMemo(
    () =>
      posts.filter(
        (post) =>
          (blogName === null || post.blogName === blogName) &&
          (category === null || (post.category ?? UNCATEGORIZED_AS) === category) &&
          (!showHiddenOnly || (justToggled.get(post.id) ?? post.hidden)),
      ),
    [posts, blogName, category, showHiddenOnly, justToggled],
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

  function selectBlog(name: string | null) {
    setBlogName(name)
    setVisibleCount(PAGE_SIZE)
  }

  function selectCategory(next: string | null) {
    setCategory(next)
    setVisibleCount(PAGE_SIZE)
  }

  function toggle(post: PostListItem) {
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
      <div className={list.filter}>
        <FilterSelect
          label="회사"
          options={blogNames.map((name) => ({ value: name, label: name }))}
          value={blogName}
          onChange={selectBlog}
        />
        <FilterSelect label="분류" options={POST_CATEGORY_OPTIONS} value={category} onChange={selectCategory} />
      </div>

      <div className={styles.card}>
        {/* 빈 목록은 빈 카드로 두지 않는다 — 비어 있는 이유와 다음에 할 일을 함께 알린다. */}
        {matched.length === 0 &&
          (showHiddenOnly ? (
            <Result
              figure={EMPTY_FIGURE}
              title="숨긴 글이 없어요"
              description={
                blogName === null
                  ? '사이트에 모든 글이 공개돼 있어요.\n전체 목록에서 공개 스위치를 끄면 여기에 모여요.'
                  : `${blogName} 글은 모두 공개돼 있어요.\n전체 목록에서 공개 스위치를 끄면 여기에 모여요.`
              }
              button={<Result.Button onClick={() => selectTab(false)}>전체 글 보기</Result.Button>}
            />
          ) : (
            <Result figure={EMPTY_FIGURE} title="공개한 글이 없어요" description="검토 대기에서 글을 공개하면 여기에 쌓여요." />
          ))}
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
