'use client'

import { useEffect, useState } from 'react'
import type { Post } from '@/lib/collector'
import { toSiteImageUrl } from '@/lib/site'
import * as styles from './todayPicks.css'

/** 사이트 실측: 제목 opacity 0→1, 400ms linear. CSS 애니메이션과 값을 맞춘다. */
const FADE_MILLISECONDS = 400

/**
 * 첫 화면 히어로에 나가는 모습 그대로.
 *
 * 사이트의 TodayPicks 를 같은 마크업·같은 스타일로 옮겼다 — 어드민에서 본 모습과
 * 실제 화면이 갈라지면 미리보기를 볼 이유가 없어진다.
 */
export function PickSlide({ picks }: { picks: Post[] }) {
  const [index, setIndex] = useState(0)
  /** 나가는 글. 크로스페이드에는 두 장이 동시에 필요하다 — 새 글만 페이드인하면 칸이 빈다. */
  const [leaving, setLeaving] = useState<Post | null>(null)

  // 고른 글이 줄어들면 index 가 목록 밖을 가리킬 수 있다.
  useEffect(() => {
    if (index >= picks.length) setIndex(0)
  }, [picks.length, index])

  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(() => setLeaving(null), FADE_MILLISECONDS)
    return () => clearTimeout(timer)
  }, [leaving])

  const post = picks[index] ?? picks[0]
  if (!post) return null

  const image = toSiteImageUrl(post.sourceThumbnail)

  function move(step: number) {
    setLeaving(picks[index] ?? null)
    setIndex((current) => (current + step + picks.length) % picks.length)
  }

  return (
    <section className={styles.section} aria-roledescription="carousel" aria-label="추천 글 미리보기">
      <div className={styles.slide}>
        <div className={styles.textColumn}>
          <div className={styles.textStack}>
            {leaving && leaving.id !== post.id && (
              <div key={leaving.id} className={`${styles.textLayer} ${styles.leaving}`} aria-hidden="true">
                <SlideText post={leaving} />
              </div>
            )}
            <div key={post.id} className={`${styles.textLayer} ${styles.entering}`}>
              <SlideText post={post} />
            </div>
          </div>

          {picks.length > 1 && (
            <div className={styles.controls}>
              <button type="button" className={styles.arrow} onClick={() => move(-1)} aria-label="이전 픽">
                <Chevron direction="left" />
              </button>
              <button type="button" className={styles.arrow} onClick={() => move(1)} aria-label="다음 픽">
                <Chevron direction="right" />
              </button>
            </div>
          )}
        </div>

        <div className={styles.imageStack}>
          {leaving && leaving.id !== post.id && toSiteImageUrl(leaving.sourceThumbnail) && (
            <div key={leaving.id} className={`${styles.imageLayer} ${styles.leaving}`} aria-hidden="true">
              <img className={styles.image} src={toSiteImageUrl(leaving.sourceThumbnail) ?? ''} alt="" />
            </div>
          )}
          <div key={post.id} className={`${styles.imageLayer} ${styles.entering}`}>
            {image ? <img className={styles.image} src={image} alt="" /> : <div className={styles.image} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function SlideText({ post }: { post: Post }) {
  return (
    <>
      <h2 className={styles.title}>{post.title}</h2>
      {post.summary && <p className={styles.summary}>{post.summary}</p>}
      <p className={styles.meta}>
        {post.blogName} · {new Date(post.publishedAt).toLocaleDateString('ko-KR')}
      </p>
    </>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}
