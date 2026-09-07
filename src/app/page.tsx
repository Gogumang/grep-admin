import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/styles/console.css'
import * as shared from '@/components/shared.css'
import { PostCountByBlog } from '@/components/PostCountByBlog'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await requireAdmin()

  // 한쪽이 죽어도 다른 쪽 숫자는 보여준다 — 대시보드가 통째로 비면 무엇이 문제인지도 모른다.
  const [postsResult, pendingResult, viewsResult] = await Promise.allSettled([
    collector.listPosts(),
    collector.listPending(),
    collector.viewSummary(),
  ])

  const posts = postsResult.status === 'fulfilled' ? postsResult.value : []
  const pending = pendingResult.status === 'fulfilled' ? pendingResult.value : []
  /**
   * 조회수는 보조 데이터다 — 애널리틱스가 막혀도 대시보드의 나머지 숫자는 보여야 한다.
   * 그래서 이 실패만은 위의 오류 줄에 넣지 않고 카드 안에서 "집계 없음"으로 말한다.
   */
  const views = viewsResult.status === 'fulfilled' ? viewsResult.value : null
  const hasViews = views !== null && views.postCount > 0

  const failures = [postsResult, pendingResult]
    .filter((result) => result.status === 'rejected')
    .map((result) => (result as PromiseRejectedResult).reason.message as string)

  const hiddenCount = posts.filter((post) => post.hidden).length
  const publishedCount = posts.length - hiddenCount

  return (
    <>
      <h1 className={styles.pageTitle}>grep</h1>

      {failures.map((message) => (
        <p key={message} className={shared.errorNotice}>{message}</p>
      ))}

      <div className={styles.cardRow}>
        <div className={styles.card}>
          <p className={styles.cardDescription}>포스팅 된 글</p>
          <p className={styles.cardValue}>{publishedCount}</p>
          <p className={styles.cardDescription}>
            {hiddenCount > 0 ? `숨김 ${hiddenCount}개 제외` : '숨긴 글 없음'}
          </p>
        </div>

        {/*
          아직 받지 않은 날에 0을 그리면 "아무도 안 봤다"는 거짓말이 된다.
          애널리틱스는 조회가 0인 글을 아예 돌려주지 않으므로, 글 수가 0이면 집계가 없는 것이다.
        */}
        <div className={styles.card}>
          <p className={styles.cardDescription}>하루 조회수</p>
          <p className={styles.cardValue}>{hasViews ? views.totalViews.toLocaleString() : '—'}</p>
          <p className={styles.cardDescription}>
            {hasViews
              ? `${new Date(`${views.date}T00:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} · 글 ${views.postCount}개`
              : '아직 집계 없음'}
          </p>
        </div>

        <div className={styles.card}>
          <p className={styles.cardDescription}>검토 대기</p>
          <p className={styles.cardValue}>{pending.length}</p>
          <p className={styles.cardDescription}>
            {pending.length > 0 ? '검토 화면에서 처리' : '밀린 글 없음'}
          </p>
        </div>
      </div>

      {posts.length > 0 ? (
        <>
          <h2 className={styles.sectionTitle}>회사별 글 수</h2>
          <div className={styles.card}>
            <PostCountByBlog posts={posts} />
          </div>
        </>
      ) : null}
    </>
  )
}
