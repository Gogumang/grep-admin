'use client'

import { useMemo, useState, useTransition } from 'react'
import { Badge, Button, useToast } from '@/shared'
import type { Post } from '@/lib/collector'
import { savePicks, type ActionResult } from './actions'
import { PickSlide } from '@/components/preview/PickSlide'
import * as styles from '@/components/shared.css'

/** 히어로에 세우는 글 수. 넘겨 담아도 화면에는 앞에서부터만 올라간다. */
const PICK_LIMIT = 5

interface PickEditorProps {
  posts: Post[]
  initialPickUrls: string[]
}

export function PickEditor({ posts, initialPickUrls }: PickEditorProps) {
  /** 저장된 값. 편집을 취소하면 여기로 되돌아간다. */
  const [savedUrls, setSavedUrls] = useState(initialPickUrls)
  const [pickUrls, setPickUrls] = useState(initialPickUrls)
  /** 기본은 보기다 — 오늘의 픽은 대개 "지금 뭐가 나가 있지"를 확인하러 들어온다. */
  const [isEditing, setIsEditing] = useState(false)
  const [query, setQuery] = useState('')
  const { openToast } = useToast()
  /** 실패만 화면에 남긴다. 저장됐다는 소식은 토스트로 지나간다. */
  const [failure, setFailure] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()

  const postsByUrl = useMemo(() => new Map(posts.map((post) => [post.url, post])), [posts])

  /** 검색은 이미 고른 글을 빼고 보여준다 — 같은 글을 두 번 넣을 이유가 없다. */
  const candidates = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return []

    return posts
      // 숨긴 글은 사이트에 안 나가므로 히어로에 세울 수 없다 — 후보에서 뺀다.
      .filter((post) => !post.hidden)
      .filter((post) => !pickUrls.includes(post.url))
      .filter((post) => {
        const haystack = `${post.title} ${post.blogName}`.toLowerCase()
        return terms.every((term) => haystack.includes(term))
      })
      .slice(0, 8)
  }, [posts, pickUrls, query])

  function move(index: number, step: number) {
    const target = index + step
    if (target < 0 || target >= pickUrls.length) return

    const next = [...pickUrls]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    setPickUrls(next)
  }

  function save() {
    startTransition(async () => {
      const outcome = await savePicks(pickUrls)
      // 저장에 실패했는데 보기로 돌아가면 안 나간 값이 나간 것처럼 보인다.
      if (!outcome.ok) {
        setFailure(outcome)
        return
      }
      setFailure(null)
      openToast(outcome.message)
      setSavedUrls(pickUrls)
      setIsEditing(false)
    })
  }

  function cancel() {
    setPickUrls(savedUrls)
    setQuery('')
    setFailure(null)
    setIsEditing(false)
  }

  /**
   * 슬라이드에 세울 글. 앞에서 PICK_LIMIT 개까지만 화면에 올라간다.
   * 숨긴 글은 사이트에 나가지 않으므로 미리보기에서도 뺀다 — 넣으면 안 나갈 것을 나간다고 보여준다.
   */
  const slidePosts = pickUrls
    .slice(0, PICK_LIMIT)
    .map((url) => postsByUrl.get(url))
    .filter((post): post is Post => post !== undefined && !post.hidden)

  /**
   * 못 나가는 픽을 두 갈래로 센다. "숨긴 글"은 다시 공개하면 살아나고, "사라진 글"은
   * 빼는 수밖에 없다 — 조치가 다르므로 한 문장으로 뭉뚱그리지 않는다.
   */
  const hiddenPickCount = pickUrls.filter((url) => postsByUrl.get(url)?.hidden).length
  const missingPickCount = pickUrls.filter((url) => !postsByUrl.has(url)).length

  return (
    <>
      {failure && <p className={styles.errorNotice}>{failure.message}</p>}

      {/* 지금 사이트에 나가 있는 모습. 편집 중에는 고른 값이 그대로 반영된다. */}
      <div className={styles.card} style={{ marginBottom: 20 }}>
        {slidePosts.length > 0 ? (
          <PickSlide picks={slidePosts} />
        ) : pickUrls.length > 0 ? (
          // 고른 글은 있는데 하나도 못 나가는 경우다. "없다"고 적으면 픽을 지운 것처럼 읽힌다.
          <p className={styles.errorNotice}>
            고른 글 {pickUrls.length}개가 모두 화면에 나가지 못합니다
            {missingPickCount > 0 && ` — 사라진 글 ${missingPickCount}개`}
            {hiddenPickCount > 0 && ` — 숨긴 글 ${hiddenPickCount}개`}. 아래에서 빼거나 다시 고르세요.
          </p>
        ) : (
          <p className={styles.mutedText}>
            고른 글이 없습니다. 이대로 두면 첫 화면이 자동 선정(최근 7일 · 블로그별 최신 1개)으로 채워집니다.
          </p>
        )}
      </div>

      {!isEditing && (
        <Button color="primary" variant="weak" size="small" onClick={() => setIsEditing(true)}>
          편집
        </Button>
      )}

      {isEditing && (
      <>
      {pickUrls.length === 0 ? (
        <p className={styles.mutedText} style={{ marginBottom: 20 }}>
          고른 글이 없습니다. 이 상태로 저장하면 화면이 자동 선정(최근 7일 · 블로그별 최신 1개)으로 돌아갑니다.
        </p>
      ) : (
        <div className={styles.card} style={{ marginBottom: 20 }}>
        <table className={styles.table}>
          <tbody>
            {pickUrls.map((url, index) => {
              const post = postsByUrl.get(url)
              return (
                <tr key={url}>
                  <td className={styles.tableCell} style={{ width: 32 }}>{index + 1}</td>
                  <td className={styles.tableCell}>
                    {/*
                      못 나가는 이유를 줄마다 밝힌다 — 숨긴 글은 다시 공개하면 살아나고,
                      사라진 글은 빼는 수밖에 없어서 조치가 다르다.
                    */}
                    {post ? post.title : <span className={styles.mutedText}>사라진 글</span>}
                    {post?.hidden && (
                      <>
                        {' '}
                        <Badge color="red" variant="weak" size="xsmall">
                          숨김 — 화면에 안 나감
                        </Badge>
                      </>
                    )}
                    {!post && (
                      <>
                        {' '}
                        <Badge color="red" variant="weak" size="xsmall">
                          글 목록에 없음
                        </Badge>
                      </>
                    )}
                    <span className={styles.truncatedUrl}>{post ? post.blogName : url}</span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.actionCell}`} style={{ width: 190 }}>
                    <Button color="light" size="small" onClick={() => move(index, -1)} disabled={index === 0} aria-label="위로">↑</Button>{' '}
                    <Button color="light" size="small" onClick={() => move(index, 1)} disabled={index === pickUrls.length - 1} aria-label="아래로">↓</Button>{' '}
                    <Button
                      color="danger"
                      variant="weak"
                      size="small"
                      onClick={() => setPickUrls(pickUrls.filter((each) => each !== url))}
                    >
                      빼기
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}

      {pickUrls.length > PICK_LIMIT && (
        <p className={styles.errorNotice}>
          화면에는 앞에서 {PICK_LIMIT}개만 올라갑니다. 뒤쪽 {pickUrls.length - PICK_LIMIT}개는 보이지 않습니다.
        </p>
      )}

      <div className={styles.formRow}>
        <input
          className={styles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="추가할 글을 제목·블로그로 검색"
          style={{ flex: 1, minWidth: 280 }}
        />
        <Button color="primary" variant="weak" size="small" onClick={save} loading={isPending}>
          저장
        </Button>
        <Button color="light" size="small" onClick={cancel} disabled={isPending}>
          취소
        </Button>
      </div>

      {candidates.length > 0 && (
        <div className={styles.card}>
        <table className={styles.table}>
          <tbody>
            {candidates.map((post) => (
              <tr key={post.id}>
                <td className={styles.tableCell}>
                  {post.title}
                  <span className={styles.truncatedUrl}>{post.blogName}</span>
                </td>
                <td className={`${styles.tableCell} ${styles.actionCell}`}>
                  <Button
                    color="light"
                    size="small"
                    onClick={() => {
                      setPickUrls([...pickUrls, post.url])
                      setQuery('')
                    }}
                  >
                    픽에 넣기
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      </>
      )}
    </>
  )
}
