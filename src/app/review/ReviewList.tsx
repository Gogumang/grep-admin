import { Badge, ListRow } from '@/shared'
import type { PendingPost } from '@/lib/collector'
import * as styles from './ReviewWorkbench.css'

/**
 * 검토 대기 목록.
 *
 * 목록은 길만 안내한다 — 공개·치우기는 전부 글별 상세 화면에 있다.
 * 체크박스로 여러 건을 한 번에 처리하던 자리를 걷어내면서 상태가 사라졌고,
 * 그래서 이 컴포넌트는 클라이언트로 내려갈 이유가 없어졌다.
 *
 * 줄 모양은 공용 ListRow가 쥔다 — 화면마다 목록 한 줄을 다시 그리지 않는다.
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
          <ListRow
            key={post.id}
            as="a"
            href={`/review/${post.id}`}
            // 목록이 길어 한 줄이 얇아야 한다 — 패널 안이라 좌우 여백도 한 단 좁힌다.
            verticalPadding="small"
            horizontalPadding="small"
            border="none"
            withTouchEffect
            withArrow
            contents={
              <ListRow.Texts
                title={post.title}
                description={
                  <>
                    {post.blogName} · {post.publishedAt.slice(0, 10)}
                    {!post.hasBody && (
                      <Badge color="yellow" variant="weak" size="xsmall">
                        본문 없음
                      </Badge>
                    )}
                  </>
                }
              />
            }
          />
        ))}
      </div>
    </div>
  )
}
