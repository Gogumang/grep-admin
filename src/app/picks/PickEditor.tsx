'use client'

import { useMemo, useState, useTransition } from 'react'
import type { Post } from '@/lib/site'
import { savePicks, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'

/** 히어로에 세우는 글 수. 넘겨 담아도 화면에는 앞에서부터만 올라간다. */
const PICK_LIMIT = 5

interface PickEditorProps {
  posts: Post[]
  initialPickUrls: string[]
}

export function PickEditor({ posts, initialPickUrls }: PickEditorProps) {
  const [pickUrls, setPickUrls] = useState(initialPickUrls)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()

  const postsByUrl = useMemo(() => new Map(posts.map((post) => [post.url, post])), [posts])

  /** 검색은 이미 고른 글을 빼고 보여준다 — 같은 글을 두 번 넣을 이유가 없다. */
  const candidates = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return []

    return posts
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
    startTransition(async () => setResult(await savePicks(pickUrls)))
  }

  return (
    <>
      {result && <p className={result.ok ? styles.notice : styles.errorNotice}>{result.message}</p>}

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
                    {/* 목록에 없는 주소일 수 있다 — 글이 숨겨졌거나 주소가 바뀐 경우다 */}
                    {post ? post.title : <span className={styles.mutedText}>목록에 없는 글</span>}
                    <span className={styles.truncatedUrl}>{post ? post.blogName : url}</span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.actionCell}`} style={{ width: 190 }}>
                    <button type="button" className={styles.quietButton} onClick={() => move(index, -1)} disabled={index === 0}>↑</button>{' '}
                    <button type="button" className={styles.quietButton} onClick={() => move(index, 1)} disabled={index === pickUrls.length - 1}>↓</button>{' '}
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => setPickUrls(pickUrls.filter((each) => each !== url))}
                    >
                      빼기
                    </button>
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
        <button type="button" className={styles.button} onClick={save} disabled={isPending}>
          {isPending ? '저장 중…' : '저장'}
        </button>
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
                  <button
                    type="button"
                    className={styles.quietButton}
                    onClick={() => {
                      setPickUrls([...pickUrls, post.url])
                      setQuery('')
                    }}
                  >
                    픽에 넣기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </>
  )
}
