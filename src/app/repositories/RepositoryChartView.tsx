import { Result } from '@/shared'
import type { ChartPeriod, RankedRepository, RepositoryChart } from '@/lib/collector'
import * as shared from '@/components/shared.css'
import * as styles from './repositories.css'

const PERIOD_LABEL: Record<ChartPeriod, string> = { daily: '오늘', weekly: '이번 주', monthly: '이번 달' }

/** 차트가 비었을 때 언제 채워지는지. 급상승만 3시간마다 다시 쌓는다. */
const COLLECTION_SCHEDULE: Record<ChartPeriod, string> = {
  daily: '3시간마다',
  weekly: '매일 07:40에',
  monthly: '매일 07:40에',
}

/** 순위 변동. 오르면 ▲, 내리면 ▼, 그대로면 –, 지난 차트에 없었으면 NEW. 첫 차트는 비교할 것이 없어 비운다. */
function Movement({ entry, hasPrevious }: { entry: RankedRepository; hasPrevious: boolean }) {
  if (!hasPrevious) return null
  if (entry.previousRank === null) return <span className={styles.isNew}>NEW</span>
  const change = entry.previousRank - entry.rank
  if (change > 0) return <span className={styles.up} aria-label={`${change}계단 오름`}>▲{change}</span>
  if (change < 0) return <span className={styles.down} aria-label={`${-change}계단 내림`}>▼{-change}</span>
  return <span className={styles.same} aria-label="변동 없음">–</span>
}

function ChartRow({ entry, period, hasPrevious }: { entry: RankedRepository; period: ChartPeriod; hasPrevious: boolean }) {
  const { repository } = entry
  const [owner, name] = repository.fullName.split('/')

  return (
    <li className={styles.row}>
      <div className={styles.rankCell}>
        <span className={styles.rank}>{entry.rank}</span>
        <Movement entry={entry} hasPrevious={hasPrevious} />
      </div>
      <div className={styles.body}>
        <a className={styles.name} href={repository.url} target="_blank" rel="noreferrer">
          <span className={styles.owner}>{owner} / </span>
          <span className={styles.repositoryName}>{name}</span>
        </a>
        {repository.description && <p className={styles.description}>{repository.description}</p>}
        <p className={styles.meta}>
          {[repository.language, `★ ${repository.totalStars.toLocaleString()}`].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className={styles.gained}>
        <div className={styles.gainedCount}>+{repository.starsGained.toLocaleString()}</div>
        <div className={styles.gainedLabel}>{PERIOD_LABEL[period]} ★</div>
      </div>
    </li>
  )
}

export function RepositoryChartView({ chart, period }: { chart: RepositoryChart | undefined; period: ChartPeriod }) {
  if (!chart || chart.entries.length === 0) {
    return (
      <div className={shared.card}>
        <Result
          figure={<img src="/illustrations/empty.png" alt="" width={100} height={100} />}
          title="아직 쌓인 차트가 없어요"
          description={`${COLLECTION_SCHEDULE[period]} GitHub에서 인기 저장소를 모아요.\n첫 차트가 쌓이면 여기에 나와요.`}
        />
      </div>
    )
  }

  const hasPrevious = chart.previousChartDate !== null

  return (
    <>
      <p className={shared.mutedText} style={{ marginBottom: 12 }}>
        {chart.chartDate} 기준 · {PERIOD_LABEL[period]} 늘어난 별이 많은 순
        {hasPrevious ? ` · 순위 변동은 ${chart.previousChartDate} 대비` : ' · 첫 차트라 순위 변동은 내일부터 보여요'}
      </p>
      <ol className={shared.card} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {chart.entries.map((entry) => (
          <ChartRow key={entry.repository.fullName} entry={entry} period={period} hasPrevious={hasPrevious} />
        ))}
      </ol>
    </>
  )
}
