'use client'

import { useState, useTransition } from 'react'
import type { PendingPost } from '@/lib/collector'
import * as styles from './ReviewWorkbench.css'
import { publishPending, rejectPending } from './actions'

/**
 * 검토 대기 목록.
 *
 * 제목을 누르면 상세 페이지로 넘어간다 — 검토는 고치면서 미리보는 일이라
 * 반쪽 패널로는 좁다. 목록에 남는 일은 여러 건을 한 번에 공개하거나 치우는 것뿐이다.
 */
export function ReviewList({ initialPending }: { initialPending: PendingPost[] }) {
  const [pending, setPending] = useState(initialPending)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggle(postId: string) {
    setChecked((previous) => {
      const next = new Set(previous)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  function run(action: () => Promise<{ ok: boolean; message: string }>, ids: string[]) {
    startTransition(async () => {
      const result = await action()
      setNotice(result)
      if (!result.ok) return
      setPending((previous) => previous.filter((post) => !ids.includes(post.id)))
      setChecked(new Set())
    })
  }

  if (pending.length === 0) {
    return (
      <div className={styles.panel}>
        <p className={styles.emptyState}>검토할 글이 없습니다. 수집이 돌면 여기에 쌓입니다.</p>
      </div>
    )
  }

  const selected = [...checked]

  return (
    <div className={styles.panel}>
      {/* 체크는 일괄 처리용, 제목은 상세로 가는 길. 자리를 나눠 서로 간섭하지 않게 한다. */}
      <div className={styles.pendingList}>
        {pending.map((post) => (
          <div key={post.id} className={styles.pendingItem}>
            <input
              type="checkbox"
              checked={checked.has(post.id)}
              onChange={() => toggle(post.id)}
              aria-label={`${post.title} 일괄 선택`}
            />
            <a href={`/review/${post.id}`} className={styles.pendingOpen}>
              <span className={styles.pendingTitle}>{post.title}</span>
              <span className={styles.pendingMeta}>
                {post.blogName} · {post.publishedAt.slice(0, 10)}
                {!post.hasBody && <span className={styles.warningBadge}>본문 없음</span>}
              </span>
            </a>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={selected.length === 0 || isPending}
          onClick={() => run(() => publishPending(selected), selected)}
        >
          {isPending ? '처리 중…' : `선택 ${selected.length}건 공개`}
        </button>
        <button
          type="button"
          className={styles.dangerButton}
          disabled={selected.length === 0 || isPending}
          onClick={() => run(() => rejectPending(selected), selected)}
        >
          치우기
        </button>
      </div>

      {notice && <p className={notice.ok ? styles.notice : styles.errorNotice}>{notice.message}</p>}
    </div>
  )
}
