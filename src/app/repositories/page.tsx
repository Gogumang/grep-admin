import { collector, type ChartPeriod, type RepositoryChart } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { PeriodTabs } from './PeriodTabs'
import { RepositoryChartView } from './RepositoryChartView'
import * as styles from './repositories.css'

export const dynamic = 'force-dynamic'

/**
 * 최근 1주·4주 동안 별이 많이 늘어난 GitHub 저장소 차트. collector가 매일 GitHub Trending 을 읽어 쌓은 것을
 * 그 앞 날과 비교해 멜론 차트처럼 순위 변동을 보여 준다.
 */
export default async function RepositoriesPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requireAdmin()
  const period: ChartPeriod = (await searchParams).period === 'monthly' ? 'monthly' : 'weekly'

  let chart: RepositoryChart | undefined
  try {
    chart = await collector.getRepositoryChart(period)
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
      <RepositoryChartView chart={chart} period={period} />
    </>
  )
}
