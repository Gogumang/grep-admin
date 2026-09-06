import { collector } from '@/lib/collector'
import { loadPostsForAdmin } from '@/lib/site'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/styles/console.css'
import * as shared from '@/components/shared.css'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await requireAdmin()

  // 한쪽이 죽어도 다른 쪽 숫자는 보여준다 — 대시보드가 통째로 비면 무엇이 문제인지도 모른다.
  const [feedsResult, postsResult] = await Promise.allSettled([collector.listFeeds(), loadPostsForAdmin()])

  const feeds = feedsResult.status === 'fulfilled' ? feedsResult.value : []
  const posts = postsResult.status === 'fulfilled' ? postsResult.value : []
  const failures = [feedsResult, postsResult]
    .filter((result) => result.status === 'rejected')
    .map((result) => (result as PromiseRejectedResult).reason.message as string)

  const hiddenCount = posts.filter((post) => post.hidden).length
  const blogsWithoutPost = feeds.filter((feed) => !posts.some((post) => post.blogKey === feed.blogKey))

  return (
    <>
      <h1 className={styles.pageTitle}>grep</h1>

      {failures.map((message) => (
        <p key={message} className={shared.errorNotice}>{message}</p>
      ))}

      <div className={styles.cardRow}>
        <div className={styles.card}>
          <p className={styles.cardDescription}>블로그</p>
          <p className={styles.cardValue}>{feeds.length}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardDescription}>공개 중인 글</p>
          <p className={styles.cardValue}>{posts.length - hiddenCount}</p>
          <p className={styles.cardDescription}>숨김 {hiddenCount}개 제외</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardDescription}>최신 글</p>
          <p className={styles.cardValue}>
            {posts[0] ? new Date(posts[0].publishedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>살펴볼 것</h2>

      {blogsWithoutPost.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>지금은 문제 없습니다</p>
            <p className={styles.emptyDescription}>모든 블로그에서 글이 들어오고 있습니다.</p>
            <a href="/collect" className={styles.button}>수집 실행</a>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>글이 하나도 수집되지 않은 블로그 {blogsWithoutPost.length}개</h3>
          <p className={styles.cardDescription}>
            {blogsWithoutPost.map((feed) => feed.blogName).join(', ')} — 피드 주소가 바뀌었거나 봇을 막고 있을 수 있습니다.
          </p>
        </div>
      )}
    </>
  )
}
