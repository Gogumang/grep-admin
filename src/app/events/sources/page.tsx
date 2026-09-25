import { collector, type EventSourceRun, type EventSourceSummary } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import { Badge } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { RefreshEventsButton } from '../RefreshEventsButton'
import * as styles from './sources.css'

export const dynamic = 'force-dynamic'

/** 갱신 버튼(서버 액션)이 판매처를 다 읽을 때까지 기다린다. 기본 제한 시간으로는 중간에 끊긴다. */
export const maxDuration = 120

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
      정상
    </Badge>
  ) : (
    <Badge color="red" variant="weak" size="xsmall" title={run.message ?? undefined}>
      못 읽음 · 기존 유지
    </Badge>
  )
}

/** 모은 행사 수 위에 올리면 무엇이 왜 빠졌는지 보인다 — 칸을 늘리지 않고 확인할 수 있게. */
function breakdown(run: EventSourceRun): string {
  return `읽음 ${run.readCount} · 지난 행사 ${run.endedCount} · 개발 외 ${run.offTopicCount} · 중복 ${run.duplicateCount}`
}

/**
 * 행사를 어디서 가져오는지. collector 가 매일 08:30 에 판매처마다 행사를 읽어 검증 대기에 넣는다.
 * 판매처별 마지막 수집 결과는 event_source_run 기록에서 온다.
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

  const failures = sources.flatMap((source) => {
    const latest = source.recentRuns[0]
    return latest && !latest.isCollected && latest.message ? [`${source.label}: ${latest.message}`] : []
  })

  return (
    <>
      <h1 className={console.pageTitle}>행사 수집처 · {sources.length}곳</h1>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        매일 08:30에 판매처마다 행사를 읽어 검증 대기로 모아요. 티켓타코는 전부, 이벤터스는 개발 행사만 모아요. 한 곳을 못
        읽으면 그곳 행사는 전날 것을 그대로 둬요. 두 곳에 같은 행사가 있으면 티켓타코 것을 남겨요.
      </p>

      <div className={shared.formRow} style={{ justifyContent: 'flex-end' }}>
        <RefreshEventsButton />
      </div>

      {failures.map((failure) => (
        <p key={failure} className={shared.errorNotice}>
          {failure}
        </p>
      ))}

      <div className={shared.card}>
        <table className={shared.table}>
          <thead>
            <tr>
              <th className={shared.tableHead}>판매처</th>
              <th className={shared.tableHead}>읽는 주소</th>
              <th className={shared.tableHead}>마지막 수집</th>
              <th className={shared.tableHead} title="지난 행사·개발 외·중복을 빼고 검증 대상으로 모은 행사">
                모은 행사
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => {
              const latest = source.recentRuns[0]
              return (
                <tr key={source.key}>
                  <td className={shared.tableCell}>
                    <a className={styles.sourceLink} href={source.homepageUrl} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  </td>
                  <td className={shared.tableCell}>
                    <span className={shared.truncatedUrl} title={source.homepageUrl}>
                      {source.homepageUrl}
                    </span>
                  </td>
                  <td className={shared.tableCell}>
                    {latest ? (
                      <span className={styles.runCell}>
                        {timeFormat.format(new Date(latest.ranAt))}
                        <RunStatus run={latest} />
                      </span>
                    ) : (
                      <span className={shared.mutedText}>기록 없음</span>
                    )}
                  </td>
                  <td className={shared.tableCell}>
                    {latest ? <span title={breakdown(latest)}>{latest.listedCount.toLocaleString()}건</span> : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
