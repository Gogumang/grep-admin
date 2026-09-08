import type { PendingPost } from '@/lib/collector'
import * as styles from './ReviewWorkbench.css'

/**
 * 검토 대기 목록.
 *
 * 목록은 길만 안내한다 — 공개·치우기는 전부 글별 상세 화면에 있다.
 * 체크박스로 여러 건을 한 번에 처리하던 자리를 걷어내면서 상태가 사라졌고,
 * 그래서 이 컴포넌트는 클라이언트로 내려갈 이유가 없어졌다.
 */
export function ReviewList({ pending }: { pending: PendingPost[] }) {
  if (pending.length === 0) {
    return (
      <div className={styles.panel}>
        <p className={styles.emptyState}>검토할 글이 없습니다. 수집이 돌면 여기에 쌓입니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.listPanel}>
      <div className={styles.pendingList}>
        {pending.map((post) => (
          <a key={post.id} href={`/review/${post.id}`} className={styles.pendingItem}>
            <span className={styles.pendingTitle}>{post.title}</span>
            <span className={styles.pendingMeta}>
              {post.blogName} · {post.publishedAt.slice(0, 10)}
              {!post.hasBody && <span className={styles.warningBadge}>본문 없음</span>}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
