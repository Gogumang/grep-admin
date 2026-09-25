import { collector, type EventSourceRun, type EventSourceSummary } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import { Badge, Result } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { RefreshEventsButton } from '../RefreshEventsButton'
import * as styles from './sources.css'

export const dynamic = 'force-dynamic'

const timeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function RunStatus({ run }: { run: EventSourceRun }) {
  return run.isCollected ? (
    <Badge color="green" variant="weak" size="xsmall">
      반영
    </Badge>
  ) : (
    <Badge color="red" variant="weak" size="xsmall" title={run.message ?? undefined}>
      못 읽음 · 기존 유지
    </Badge>
  )
}

function SourceCard({ source }: { source: EventSourceSummary }) {
  const latest = source.recentRuns[0]
  return (
    <section className={shared.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.sourceName}>
          <a href={source.homepageUrl} target="_blank" rel="noreferrer">
            {source.label}
          </a>
        </h2>
        {latest && <RunStatus run={latest} />}
      </header>

      <dl className={styles.stats}>
        <div>
          <dt>올린 행사(사이트 후보)</dt>
          <dd>{source.listedNow.toLocaleString()}건</dd>
        </div>
        <div>
          <dt>마지막 수집</dt>
          <dd>{latest ? timeFormat.format(new Date(latest.ranAt)) : '—'}</dd>
        </div>
        <div>
          <dt>읽은 행사</dt>
          <dd>{latest ? `${latest.readCount.toLocaleString()}건` : '—'}</dd>
        </div>
      </dl>

      {latest && !latest.isCollected && latest.message && <p className={shared.errorNotice}>{latest.message}</p>}

      {source.recentRuns.length === 0 ? (
        <p className={shared.mutedText}>아직 수집 기록이 없어요. 매일 08:30에 모으고, 위 버튼으로 바로 돌릴 수 있어요.</p>
      ) : (
        <table className={shared.table}>
          <thead>
            <tr>
              <th className={shared.tableHead}>시각</th>
              <th className={shared.tableHead}>결과</th>
              <th className={shared.tableHead}>읽음</th>
              <th className={shared.tableHead} title="끝난 행사">지난 행사</th>
              <th className={shared.tableHead} title="개발 행사가 아니거나 교육 과정·강의 판매">개발 외</th>
              <th className={shared.tableHead} title="다른 판매처에 같은 행사가 있어 뺌">중복</th>
              <th className={shared.tableHead} title="규칙을 통과해 검증 대상으로 모은 행사">모음</th>
            </tr>
          </thead>
          <tbody>
            {source.recentRuns.map((run) => (
              <tr key={run.ranAt}>
                <td className={shared.tableCell}>{timeFormat.format(new Date(run.ranAt))}</td>
                <td className={shared.tableCell}>
                  <RunStatus run={run} />
                </td>
                <td className={shared.tableCell}>{run.readCount.toLocaleString()}</td>
                <td className={shared.tableCell}>{run.endedCount.toLocaleString()}</td>
                <td className={shared.tableCell}>{run.offTopicCount.toLocaleString()}</td>
                <td className={shared.tableCell}>{run.duplicateCount.toLocaleString()}</td>
                <td className={shared.tableCell}>
                  <strong>{run.listedCount.toLocaleString()}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

/**
 * 행사를 어디서 가져오는지와, 판매처마다 최근에 몇 건을 읽어 몇 건을 싣고 무엇이 왜 빠졌는지.
 * collector 가 매일 08:30 에 모을 때마다 판매처별로 기록을 남긴다(event_source_run).
 */
export default async function EventSourcesPage() {
  await requireAdmin()

  let sources: EventSourceSummary[]
  try {
    sources = await collector.listEventSources()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>행사 수집처</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={console.pageTitle}>행사 수집처 · {sources.length}곳</h1>
        <RefreshEventsButton />
      </div>
      <p className={shared.mutedText}>
        매일 08:30에 판매처마다 행사를 읽어 개발 행사만 골라 검증 대기로 모아요. 행사 일정의 &lsquo;새로 모은 행사&rsquo;에서 올린 것만 사이트
        후보가 돼요. 한 곳을 못 읽으면 그곳 행사는 전날 것을 그대로 둬요. 두 곳에 같은 행사가 있으면 티켓타코 것을 남겨요.
      </p>
      {sources.length === 0 ? (
        <div className={shared.card}>
          <Result title="수집처가 없어요" description="collector 설정을 확인해 주세요." />
        </div>
      ) : (
        <div className={styles.cards}>
          {sources.map((source) => (
            <SourceCard key={source.key} source={source} />
          ))}
        </div>
      )}
    </>
  )
}
