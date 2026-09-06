'use client'

import { useMemo, useState, useTransition } from 'react'
import type { Post } from '@/lib/site'
import { togglePostHidden, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'

/** 한 번에 그리는 글 수. 667개를 한 화면에 늘어놓으면 브라우저가 버벅인다. */
const PAGE_SIZE = 40

export function PostManager({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  const matched = useMemo(() => {
    // 낱말이 여럿이면 모두 걸려야 한다 — 공개 사이트의 검색과 같은 규칙이다.
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    const byQuery = posts.filter((post) => {
      if (terms.length === 0) return true
      const haystack = [post.title, post.summary, post.blogName, ...post.tags].join(' ').toLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
    return showHiddenOnly ? byQuery.filter((post) => post.hidden) : byQuery
  }, [posts, query, showHiddenOnly])

  const visible = matched.slice(0, visibleCount)

  function toggle(post: Post) {
    // 실패를 삼키면 눌렀는데 아무 일도 안 일어난 것처럼 보인다.
    startTransition(async () => setResult(await togglePostHidden(post.id, !post.hidden)))
  }

  return (
    <>
      {result && <p className={result.ok ? styles.notice : styles.errorNotice}>{result.message}</p>}

      <div className={styles.formRow}>
        <input
          className={styles.input}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          placeholder="제목·요약·블로그로 검색"
          style={{ flex: 1, minWidth: 260 }}
        />
        <button
          type="button"
          className={showHiddenOnly ? styles.button : styles.quietButton}
          onClick={() => setShowHiddenOnly((only) => !only)}
        >
          숨긴 글만
        </button>
      </div>

      <p className={styles.mutedText} style={{ marginBottom: 12 }}>
        {matched.length}개
      </p>

      <div className={styles.card}>
        <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHead}>제목</th>
            <th className={styles.tableHead}>블로그</th>
            <th className={styles.tableHead}>발행</th>
            <th className={`${styles.tableHead} ${styles.actionCell}`} />
          </tr>
        </thead>
        <tbody>
          {visible.map((post) => (
            <tr key={post.id} className={post.hidden ? styles.hiddenRow : undefined}>
              <td className={styles.tableCell}>
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </a>
                <span className={styles.truncatedUrl}>{post.url}</span>
              </td>
              <td className={styles.tableCell}>{post.blogName}</td>
              <td className={styles.tableCell}>
                {new Date(post.publishedAt).toLocaleDateString('ko-KR')}
              </td>
              <td className={`${styles.tableCell} ${styles.actionCell}`}>
                <button
                  type="button"
                  className={post.hidden ? styles.quietButton : styles.dangerButton}
                  onClick={() => toggle(post)}
                  disabled={isPending}
                >
                  {post.hidden ? '다시 보이기' : '숨기기'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
