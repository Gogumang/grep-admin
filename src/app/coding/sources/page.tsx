import { collector, type CodingSourceRun, type CodingSourceSummary } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as blogStyles from '../../blogs/blogManager.css'
import { CodingSourceSwitch } from './CodingSourceSwitch'
import { CollectCodingButton } from './CollectCodingButton'

export const dynamic = 'force-dynamic'

/** '지금 가져오기'(서버 액션)가 수집처 네 곳을 다 읽을 때까지 기다린다. collector 쪽 제한(3분)보다 길게 둔다. */
export const maxDuration = 200

function formatDateTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function describeRun(run: CodingSourceRun | undefined): string {
  if (!run) return '아직 읽지 않음'
  const when = formatDateTime(run.ranAt)
  return run.isCollected ? `${when} · ${run.readCount.toLocaleString()}문제 읽음, 새로 ${run.newCount.toLocaleString()}` : `${when} · 못 읽음`
}

/**
 * 코딩테스트 문제를 어디서 가져오는지. 목록 정보(제목·난이도·태그·원문 주소)만 문제 후보로 쌓고, 지문은 후보에서
 * '초안으로 가져오기'를 누른 문제 하나만 그때 받는다.
 */
export default async function CodingSourcesPage() {
  await requireAdmin()

  let sources: CodingSourceSummary[]
  try {
    sources = await collector.listCodingSources()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>코딩테스트 수집처</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  // 마지막 수집이 실패했으면 이유를 알린다 — 스위치만 보고는 켜 둔 곳이 멈춘 줄 모른다(solved.ac 의 Cloudflare 등).
  const failures = sources.flatMap((source) => {
    const latest = source.recentRuns[0]
    return source.enabled && latest && !latest.isCollected && latest.message ? [`${source.label}: ${latest.message}`] : []
  })

  return (
    <>
      <h1 className={console.pageTitle}>코딩테스트 수집처</h1>
      <div className={shared.formRow} style={{ justifyContent: 'flex-end' }}>
        <CollectCodingButton />
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
              <th className={shared.tableHead}>수집처</th>
              <th className={shared.tableHead}>쌓인 후보</th>
              <th className={shared.tableHead}>마지막 수집</th>
              <th className={`${shared.tableHead} ${blogStyles.switchCell}`}>수집</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.key} className={source.enabled ? undefined : blogStyles.inactiveRow}>
                <td className={shared.tableCell}>
                  <a href={source.homepageUrl} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                </td>
                <td className={shared.tableCell}>
                  <a href={`/coding/candidates?source=${source.key}`}>{source.candidateCount.toLocaleString()}문제</a>
                </td>
                <td className={shared.tableCell}>{describeRun(source.recentRuns[0])}</td>
                <td className={`${shared.tableCell} ${blogStyles.switchCell}`}>
                  <CodingSourceSwitch sourceKey={source.key} name={source.label} enabled={source.enabled} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
