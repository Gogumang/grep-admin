import { collector, type DailyViewSummary } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/styles/console.css'
import * as shared from '@/components/shared.css'
import { PostCountByBlog } from '@/components/PostCountByBlog'

export const dynamic = 'force-dynamic'

/** 조회수를 세는 기준 시간대. collector(JVM이 Asia/Seoul)와 같은 날을 가리켜야 한다. */
const SEOUL_TIME_ZONE = 'Asia/Seoul'

const ONE_DAY_MILLISECONDS = 24 * 60 * 60 * 1000

/**
 * 서울 기준 어제 (YYYYMMDD).
 *
 * 날짜를 뽑은 뒤 하루를 빼지 않고, 24시간 전 시각을 서울 기준으로 적는다 — 서버가
 * UTC로 도는 Vercel 이라 "오늘"부터 서울과 다르다. KST 00~09시에는 UTC 날짜가 아직
 * 전날이어서, 거기서 하루를 더 빼면 이틀 전을 부르게 된다. Airflow 가 날짜를 직접
 * 계산해 넘기는 것과 같은 이유다 (KST 는 서머타임이 없어 24시간이 곧 하루다).
 */
function seoulYesterday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(Date.now() - ONE_DAY_MILLISECONDS))
    .replaceAll('-', '')
}

/** "2026-09-11" → "9월 11일". 어느 날 숫자인지 카드 아래 줄에 밝힐 때 쓴다. */
function formatMonthDay(isoDate: string): string {
  // 날짜만 있는 문자열은 UTC 자정으로 읽힌다 — 같은 UTC 로 적어야 하루가 밀리지 않는다.
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'UTC', month: 'long', day: 'numeric' })
    .format(new Date(isoDate))
}

/** 집계가 들어와 있는 날인가. 애널리틱스는 조회가 0인 글을 아예 돌려주지 않는다. */
function hasCollected(summary: DailyViewSummary | null): summary is DailyViewSummary {
  return summary !== null && summary.postCount > 0
}

export default async function DashboardPage() {
  await requireAdmin()

  // 한쪽이 죽어도 다른 쪽 숫자는 보여준다 — 대시보드가 통째로 비면 무엇이 문제인지도 모른다.
  const [postsResult, pendingResult, todayResult, yesterdayResult] = await Promise.allSettled([
    collector.listPosts(),
    collector.listPending(),
    collector.viewSummary(),
    collector.viewSummary(seoulYesterday()),
  ])

  const posts = postsResult.status === 'fulfilled' ? postsResult.value : []
  const pending = pendingResult.status === 'fulfilled' ? pendingResult.value : []
  /**
   * 조회수는 보조 데이터다 — 애널리틱스가 막혀도 대시보드의 나머지 숫자는 보여야 한다.
   * 그래서 이 실패만은 위의 오류 줄에 넣지 않고 카드 안에서 "집계 없음"으로 말한다.
   */
  const today = todayResult.status === 'fulfilled' ? todayResult.value : null
  const yesterday = yesterdayResult.status === 'fulfilled' ? yesterdayResult.value : null

  /**
   * 오늘치가 아직 없으면 어제치로 물러선다.
   *
   * GA4 당일 집계가 몇 시간 늦어서, 오늘치만 보면 하루의 절반 넘게 카드가 비어 있었다 —
   * 2026-09-12 오후 3시에도 오늘 행이 한 건도 없었다. 비어 있는 칸은 "조회수가 안 나온다"로
   * 읽힌다. 대신 어제 숫자를 오늘로 오해하지 않도록 어느 날짜인지 반드시 함께 적는다.
   */
  const views = hasCollected(today) ? today : hasCollected(yesterday) ? yesterday : null
  const isToday = views !== null && views === today

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
          {/* 숨긴 글이 없으면 아래 줄을 아예 두지 않는다 — "없음"은 숫자가 이미 하는 말이다. */}
          {hiddenCount > 0 && (
            <p className={styles.cardDescription}>숨김 {hiddenCount}개 제외</p>
          )}
        </div>

        {/*
          어제치까지 비어 있으면 0을 그리지 않는다 — 애널리틱스는 조회가 0인 글을 아예
          돌려주지 않으므로, 0은 "아무도 안 봤다"가 아니라 "아직 안 받았다"는 뜻이다.

          오늘치는 하루가 끝나지 않아 계속 올라가는 잠정값이다 — 그 사실을 아래 줄에 밝힌다.
          밝히지 않으면 아침에 본 숫자가 저녁에 달라진 것을 오류로 읽는다.
        */}
        <div className={styles.card}>
          <p className={styles.cardDescription}>{isToday ? '오늘 조회수' : '조회수'}</p>
          <p className={styles.cardValue}>{views !== null ? views.totalViews.toLocaleString() : '—'}</p>
          {views !== null && (
            <p className={styles.cardDescription}>
              {isToday ? `글 ${views.postCount}개 · 잠정` : `${formatMonthDay(views.date)} 기준`}
            </p>
          )}
        </div>

        <div className={styles.card}>
          <p className={styles.cardDescription}>검토 대기</p>
          <p className={styles.cardValue}>{pending.length}</p>
          {pending.length === 0 && <p className={styles.cardDescription}>밀린 글 없음</p>}
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
