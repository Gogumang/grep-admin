import { collector, type EventSourceSummary } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as blogStyles from '../../blogs/blogManager.css'
import { RefreshEventsButton } from '../RefreshEventsButton'
import { EventSourceSwitch } from './EventSourceSwitch'
import * as styles from './sources.css'

export const dynamic = 'force-dynamic'

/** 갱신 버튼(서버 액션)이 판매처를 다 읽을 때까지 기다린다. 기본 제한 시간으로는 중간에 끊긴다. */
export const maxDuration = 120

/**
 * 행사를 어디서 가져오는지. collector 가 매일 08:30 에 켜 둔 판매처마다 행사를 읽어 검증 대기에 넣는다.
 * 채용 수집처처럼 판매처마다 수집을 켜고 끈다.
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

  // 수집 기록 칸은 뺐지만 마지막 수집이 실패했으면 알린다 — 스위치만 보고는 켜 둔 곳이 멈춘 줄 모른다.
  const failures = sources.flatMap((source) => {
    const latest = source.recentRuns[0]
    return source.enabled && latest && !latest.isCollected && latest.message ? [`${source.label}: ${latest.message}`] : []
  })
  const disabledCount = sources.filter((source) => !source.enabled).length

  return (
    <>
      <h1 className={console.pageTitle}>
        행사 수집처 · {sources.length}곳{disabledCount > 0 && ` · ${disabledCount}곳 꺼둠`}
      </h1>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        매일 08:30에 켜 둔 판매처마다 행사를 읽어 검증 대기로 모아요. 티켓타코는 전부, 이벤터스는 개발 행사만, Dev-Event(개발자 행사 모음)는 해커톤만, Meetup·Luma는 서울의 개발 모임만 모아요. 한 곳을
        못 읽으면 그곳 행사는 전날 것을 그대로 둬요. 여러 곳에 같은 행사가 있으면 티켓타코 → 이벤터스 → Dev-Event → Meetup → Luma 순으로 앞의 것을 남겨요.
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
              <th className={`${shared.tableHead} ${blogStyles.switchCell}`}>수집</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.key} className={source.enabled ? undefined : blogStyles.inactiveRow}>
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
                <td className={`${shared.tableCell} ${blogStyles.switchCell}`}>
                  <EventSourceSwitch sourceKey={source.key} name={source.label} enabled={source.enabled} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
