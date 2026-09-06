import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/styles/console.css'
import * as shared from '@/components/shared.css'
import { PostCountByBlog } from '@/components/PostCountByBlog'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await requireAdmin()

  // 한쪽이 죽어도 다른 쪽 숫자는 보여준다 — 대시보드가 통째로 비면 무엇이 문제인지도 모른다.
  const [postsResult, pendingResult] = await Promise.allSettled([collector.listPosts(), collector.listPending()])

  const posts = postsResult.status === 'fulfilled' ? postsResult.value : []
  const pending = pendingResult.status === 'fulfilled' ? pendingResult.value : []
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
          조회수는 아직 붙일 곳이 없다. 숫자 자리에 0을 넣으면 "아무도 안 봤다"는
          거짓말이 되므로, 값이 없다는 것과 무엇을 해야 하는지를 대신 적는다.
        */}
        <div className={styles.card}>
          <p className={styles.cardDescription}>하루 조회수</p>
          <p className={styles.cardValue}>—</p>
          <p className={styles.cardDescription}>구글 애널리틱스 연결 필요</p>
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
