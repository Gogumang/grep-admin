import { collector, type JobSource } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { CompanyIcon } from './CompanyIcon'
import { JobCollectRunner } from './JobCollectRunner'
import { JobSourceSwitch } from './JobSourceSwitch'
import * as styles from './sources.css'
import * as blogStyles from '../../blogs/blogManager.css'
import * as clubStyles from '../../clubs/clubs.css'

export const dynamic = 'force-dynamic'

/** 동아리 수집처와 같은 크기 — 줄 높이를 늘리지 않는다. */
const ICON_SIZE = 24

/** 회사 하나를 받는 서버 액션이 끝날 때까지 기다린다. 공고가 많은 곳은 본문까지 받아 1분을 넘길 수 있다. */
export const maxDuration = 120

/**
 * 채용공고를 어디서 가져오는지. collector 가 매일 08:00 에 여기 적힌 회사의 채용 페이지를 읽어
 * 새 공고를 검증 대기에 넣는다. 수동으로 바로(전체) 가져올 수도 있다.
 */
export default async function JobSourcesPage() {
  await requireAdmin()

  let sources: JobSource[]
  try {
    sources = await collector.listJobSources()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>채용 수집처</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  // 꺼둔 회사는 목록에 그대로 있어서, 세지 않으면 수집이 몇 곳에서 도는지 알 수 없다.
  const enabledSources = sources.filter((source) => source.enabled)
  const disabledCount = sources.length - enabledSources.length

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={console.pageTitle}>
          채용 수집처 · {sources.length}곳{disabledCount > 0 && ` · ${disabledCount}곳 꺼둠`}
        </h1>
      </div>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        매일 08:00에 켜 둔 회사의 채용 페이지를 읽어 새 공고를 채용 검증에 넣어요. 지금 바로 가져오면 회사를 하나씩 돌며
        어디를 가져오는 중인지 보여 줘요.
      </p>

      <JobCollectRunner companies={enabledSources.map(({ companyKey, companyName }) => ({ companyKey, companyName }))} />

      <div className={shared.card}>
        <table className={shared.table}>
          <thead>
            <tr>
              <th className={shared.tableHead}>회사</th>
              <th className={shared.tableHead}>읽는 주소</th>
              <th className={`${shared.tableHead} ${blogStyles.switchCell}`}>수집</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.companyKey} className={source.enabled ? undefined : blogStyles.inactiveRow}>
                <td className={shared.tableCell}>
                  <span className={clubStyles.nameCell}>
                    <CompanyIcon companyKey={source.companyKey} name={source.companyName} size={ICON_SIZE} />
                    <a className={styles.companyLink} href={source.homepageUrl} target="_blank" rel="noreferrer">
                      {source.companyName}
                    </a>
                  </span>
                </td>
                <td className={shared.tableCell}>
                  <span className={shared.truncatedUrl} title={source.boardUrl}>
                    {source.boardUrl}
                  </span>
                </td>
                <td className={`${shared.tableCell} ${blogStyles.switchCell}`}>
                  <JobSourceSwitch companyKey={source.companyKey} name={source.companyName} enabled={source.enabled} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
