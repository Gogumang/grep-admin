'use client'

import { useState, useTransition } from 'react'
import type { BlogFeed } from '@/lib/collector'
import { addBlog, removeBlog, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'

export function BlogManager({ feeds }: { feeds: BlogFeed[] }) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const outcome = await addBlog(formData)
      setResult(outcome)
      // 실패하면 입력값을 남겨둔다 — 주소를 다시 치게 만들지 않는다.
      if (outcome.ok) (document.getElementById('add-blog-form') as HTMLFormElement)?.reset()
    })
  }

  function remove(feed: BlogFeed) {
    startTransition(async () => setResult(await removeBlog(feed.blogKey)))
  }

  return (
    <>
      {result && (
        <p className={result.ok ? styles.notice : styles.errorNotice}>{result.message}</p>
      )}

      <form id="add-blog-form" action={submit} className={styles.formRow}>
        <input className={styles.input} name="blogName" placeholder="블로그 이름 (예: 카카오)" required />
        <input
          className={styles.input}
          name="feedUrl"
          placeholder="피드 주소 (예: https://tech.kakao.com/feed/)"
          style={{ flex: 1, minWidth: 280 }}
          required
        />
        <button type="submit" className={styles.button} disabled={isPending}>
          {isPending ? '확인 중…' : '추가'}
        </button>
      </form>

      <div className={styles.card}>
        <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHead}>블로그</th>
            <th className={styles.tableHead}>피드 주소</th>
            <th className={`${styles.tableHead} ${styles.actionCell}`} />
          </tr>
        </thead>
        <tbody>
          {feeds.map((feed) => (
            <tr key={feed.feedUrl}>
              <td className={styles.tableCell}>{feed.blogName}</td>
              <td className={styles.tableCell}>
                <span className={styles.truncatedUrl}>{feed.feedUrl}</span>
              </td>
              <td className={`${styles.tableCell} ${styles.actionCell}`}>
                <button type="button" className={styles.dangerButton} onClick={() => remove(feed)} disabled={isPending}>
                  제거
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  )
}
