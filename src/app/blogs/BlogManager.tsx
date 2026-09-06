'use client'

import { useState, useTransition } from 'react'
import type { BlogFeed } from '@/lib/collector'
import { addBlog, editBlog, removeBlog, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'

export function BlogManager({ feeds }: { feeds: BlogFeed[] }) {
  const [result, setResult] = useState<ActionResult | null>(null)
  /** 지금 고치고 있는 블로그의 blogKey. 한 번에 한 줄만 연다. */
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [draft, setDraft] = useState({ blogName: '', feedUrl: '' })
  const [isPending, startTransition] = useTransition()

  function startEdit(feed: BlogFeed) {
    setEditingKey(feed.blogKey)
    setDraft({ blogName: feed.blogName, feedUrl: feed.feedUrl })
    setResult(null)
  }

  function saveEdit(blogKey: string) {
    startTransition(async () => {
      const outcome = await editBlog(blogKey, draft.blogName, draft.feedUrl)
      setResult(outcome)
      // 실패하면 입력값을 남겨둔다 — 주소를 다시 치게 만들지 않는다.
      if (outcome.ok) setEditingKey(null)
    })
  }

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
            <tr key={feed.blogKey}>
              {editingKey === feed.blogKey ? (
                <>
                  <td className={styles.tableCell}>
                    <input
                      className={styles.input}
                      value={draft.blogName}
                      onChange={(event) => setDraft({ ...draft, blogName: event.target.value })}
                      aria-label="블로그 이름"
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <input
                      className={styles.input}
                      value={draft.feedUrl}
                      onChange={(event) => setDraft({ ...draft, feedUrl: event.target.value })}
                      style={{ width: '100%' }}
                      aria-label="피드 주소"
                    />
                  </td>
                  <td className={`${styles.tableCell} ${styles.actionCell}`}>
                    <button type="button" className={styles.button} onClick={() => saveEdit(feed.blogKey)} disabled={isPending}>
                      {isPending ? '확인 중…' : '저장'}
                    </button>{' '}
                    <button type="button" className={styles.quietButton} onClick={() => setEditingKey(null)} disabled={isPending}>
                      취소
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className={styles.tableCell}>{feed.blogName}</td>
                  <td className={styles.tableCell}>
                    <span className={styles.truncatedUrl}>{feed.feedUrl}</span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.actionCell}`}>
                    <button type="button" className={styles.quietButton} onClick={() => startEdit(feed)} disabled={isPending}>
                      수정
                    </button>{' '}
                    <button type="button" className={styles.dangerButton} onClick={() => remove(feed)} disabled={isPending}>
                      제거
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  )
}
