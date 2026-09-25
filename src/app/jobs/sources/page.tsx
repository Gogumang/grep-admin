import { collector, type JobSource } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { JobCollectRunner } from './JobCollectRunner'
import * as styles from './sources.css'

export const dynamic = 'force-dynamic'

/** 회사 하나를 받는 서버 액션이 끝날 때까지 기다린다. 공고가 많은 곳은 본문까지 받아 1분을 넘길 수 있다. */
export const maxDuration = 120

/** 채용 시스템 종류를 사람이 읽는 이름으로. collector 의 JobBoardType 과 짝이다. */
const BOARD_LABEL: Record<string, string> = {
  KAKAO: '카카오 자체 API',
  NAVER: '네이버 자체 API',
  WOOWAHAN: '우아한형제들 자체 API',
  GREENHOUSE: 'Greenhouse',
  GREETING_HR: '그리팅',
  WORKDAY: 'Workday',
  LINE: '라인 채용(page-data)',
}

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

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={console.pageTitle}>채용 수집처 · {sources.length}곳</h1>
      </div>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        매일 08:00에 아래 회사의 채용 페이지를 읽어 새 공고를 채용 검증에 넣어요. 지금 바로 가져오면 회사를 하나씩 돌며
        어디를 가져오는 중인지 보여 줘요.
      </p>

      <JobCollectRunner companies={sources.map(({ companyKey, companyName }) => ({ companyKey, companyName }))} />

      <div className={shared.card}>
        <table className={shared.table}>
          <thead>
            <tr>
              <th className={shared.tableHead}>회사</th>
              <th className={shared.tableHead}>채용 시스템</th>
              <th className={shared.tableHead}>읽는 주소</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.companyKey}>
                <td className={shared.tableCell}>
                  <a className={styles.companyLink} href={source.homepageUrl} target="_blank" rel="noreferrer">
                    {source.companyName}
                  </a>
                </td>
                <td className={shared.tableCell}>{BOARD_LABEL[source.boardType] ?? source.boardType}</td>
                <td className={shared.tableCell}>
                  <span className={shared.truncatedUrl} title={source.boardUrl}>
                    {source.boardUrl}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
