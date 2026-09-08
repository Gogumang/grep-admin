'use client'

import { useState, useTransition } from 'react'
import { Button, useDialog, useToast } from '@/shared'
import type { BlogFeed } from '@/lib/collector'
import { addBlog, editBlog, removeBlog, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'

export function BlogManager({ feeds }: { feeds: BlogFeed[] }) {
  const { openToast } = useToast()
  const { openAsyncConfirm } = useDialog()
  /**
   * 실패한 결과만 담는다. 성공은 토스트로 흘려보내고, 실패는 화면에 남긴다 —
   * 무엇이 잘못됐는지는 고칠 때까지 보여야 한다.
   */
  const [failure, setFailure] = useState<ActionResult | null>(null)
  /** 지금 고치고 있는 블로그의 blogKey. 한 번에 한 줄만 연다. */
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [draft, setDraft] = useState({ blogName: '', feedUrl: '' })
  const [isPending, startTransition] = useTransition()

  /** 성공은 토스트, 실패는 화면. 세 군데가 같은 규칙을 쓰므로 한곳에 모은다. */
  function report(outcome: ActionResult): boolean {
    if (outcome.ok) {
      openToast(outcome.message)
      setFailure(null)
      return true
    }
    setFailure(outcome)
    return false
  }

  function startEdit(feed: BlogFeed) {
    setEditingKey(feed.blogKey)
    setDraft({ blogName: feed.blogName, feedUrl: feed.feedUrl })
    setFailure(null)
  }

  function saveEdit(blogKey: string) {
    startTransition(async () => {
      // 실패하면 입력값을 남겨둔다 — 주소를 다시 치게 만들지 않는다.
      if (report(await editBlog(blogKey, draft.blogName, draft.feedUrl))) setEditingKey(null)
    })
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      // 실패하면 입력값을 남겨둔다 — 주소를 다시 치게 만들지 않는다.
      if (report(await addBlog(formData))) {
        ;(document.getElementById('add-blog-form') as HTMLFormElement)?.reset()
      }
    })
  }

  /**
   * 제거는 되돌릴 수 없으니 한 번 묻는다. openAsyncConfirm은 서버 응답이 올 때까지
   * 확인 버튼을 잠가, 느린 응답에 같은 요청을 두 번 보내는 것을 막는다.
   */
  function remove(feed: BlogFeed) {
    void openAsyncConfirm({
      title: `${feed.blogName}을 제거할까요?`,
      description: '수집 목록에서 빠집니다. 이미 모은 글은 그대로 남습니다.',
      confirmButton: <Button color="danger" size="medium" display="block">제거하기</Button>,
      onConfirmClick: async () => {
        report(await removeBlog(feed.blogKey))
      },
    })
  }

  return (
    <>
      {failure && <p className={styles.errorNotice}>{failure.message}</p>}

      <form id="add-blog-form" action={submit} className={styles.formRow}>
        <input className={styles.input} name="blogName" placeholder="블로그 이름 (예: 카카오)" required />
        <input
          className={styles.input}
          name="feedUrl"
          placeholder="피드 주소 (예: https://tech.kakao.com/feed/)"
          style={{ flex: 1, minWidth: 280 }}
          required
        />
        <Button type="submit" color="primary" variant="weak" size="small" disabled={isPending}>
          {isPending ? '확인 중…' : '추가'}
        </Button>
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
                    <Button color="primary" variant="weak" size="small" onClick={() => saveEdit(feed.blogKey)} disabled={isPending}>
                      {isPending ? '확인 중…' : '저장'}
                    </Button>{' '}
                    <Button color="light" size="small" onClick={() => setEditingKey(null)} disabled={isPending}>
                      취소
                    </Button>
                  </td>
                </>
              ) : (
                <>
                  <td className={styles.tableCell}>{feed.blogName}</td>
                  <td className={styles.tableCell}>
                    <span className={styles.truncatedUrl}>{feed.feedUrl}</span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.actionCell}`}>
                    <Button color="light" size="small" onClick={() => startEdit(feed)} disabled={isPending}>
                      수정
                    </Button>{' '}
                    <Button color="danger" variant="weak" size="small" onClick={() => remove(feed)} disabled={isPending}>
                      제거
                    </Button>
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
