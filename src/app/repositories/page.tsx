import { collector, type ChartPeriod, type RepositoryChart } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { ChartCalendar } from './ChartCalendar'
import { PeriodTabs } from './PeriodTabs'
import { RepositoryChartView } from './RepositoryChartView'
import * as styles from './repositories.css'

export const dynamic = 'force-dynamic'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * 오늘(급상승)·최근 1주·4주 동안 별이 많이 늘어난 GitHub 저장소 차트. collector가 매일 GitHub Trending 을 읽어 쌓은 것을
 * 그 앞 날과 비교해 멜론 차트처럼 순위 변동을 보여 준다. 오른쪽 달력으로 지난 차트를 고른다(?date=, 주간은 한 주 단위).
 */
export default async function RepositoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>
}) {
  await requireAdmin()
  const { period: requestedPeriod, date: requestedDate } = await searchParams
  const period: ChartPeriod = requestedPeriod === 'monthly' || requestedPeriod === 'daily' ? requestedPeriod : 'weekly'
  // 형식이 틀린 주소는 collector 까지 보내지 않고 최신 차트를 연다.
  const date = requestedDate && DATE_PATTERN.test(requestedDate) ? requestedDate : undefined

  let chart: RepositoryChart | undefined
  // 날짜 목록은 보조다 — 못 불러오면 달력만 빼고 차트는 그대로 보인다.
  let chartDates: string[] | null
  try {
    ;[chart, chartDates] = await Promise.all([
      collector.getRepositoryChart(period, date),
      collector
        .listRepositoryChartDates(period)
        .then((response) => response.dates)
        .catch(() => null),
    ])
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>인기 저장소</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  return (
    <>
      <h1 className={console.pageTitle}>인기 저장소 차트</h1>
      <div className={styles.tabs}>
        <PeriodTabs period={period} />
      </div>
      {chart && chartDates === null && <p className={shared.errorNotice}>collector 에서 차트 날짜를 불러오지 못해 달력을 숨겼어요.</p>}
      <div className={styles.layout}>
        <div className={styles.chartColumn}>
          <RepositoryChartView chart={chart} period={period} />
        </div>
        {chart && chartDates && chartDates.length > 0 && (
          <aside className={[shared.card, styles.calendarColumn].join(' ')}>
            <ChartCalendar key={period} period={period} chartDate={chart.chartDate} chartDates={chartDates} />
          </aside>
        )}
      </div>
    </>
  )
}
