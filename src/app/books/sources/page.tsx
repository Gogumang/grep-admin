import { books, type BookSourceRun, type BookSourceSummary } from '@/lib/books'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { SourceIcon } from '@/components/SourceIcon'
import * as blogStyles from '../../blogs/blogManager.css'
import * as clubStyles from '../../clubs/clubs.css'
import { BookSourceSwitch } from './BookSourceSwitch'
import { CollectBooksButton } from './CollectBooksButton'

export const dynamic = 'force-dynamic'

/** 코딩테스트 수집처 로고와 같은 크기. */
const ICON_SIZE = 24

/** '지금 가져오기'(서버 액션)가 수집처를 다 읽을 때까지 기다린다. 처음에는 표지를 받느라 몇 분 걸린다. */
export const maxDuration = 300

function formatDateTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function describeRun(run: BookSourceRun | undefined): string {
  if (!run) return '아직 읽지 않음'
  const when = formatDateTime(run.ranAt)
  return run.isCollected ? `${when} · ${run.readCount.toLocaleString()}권 읽음, 새로 ${run.newCount.toLocaleString()}` : `${when} · 못 읽음`
}

/**
 * 컴퓨터 분야 책을 어디서 가져오는지. 베스트셀러·신간 목록을 읽어 처음 본 책만 쌓고, 표지는 그때 한 번 받아 둔다 —
 * 이미 쌓은 책은 다시 받지 않는다.
 */
export default async function BookSourcesPage() {
  await requireAdmin()

  let sources: BookSourceSummary[]
  try {
    sources = await books.listSources()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>책 수집처</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  // 마지막 수집이 실패했으면 이유를 알린다 — 스위치만 보고는 켜 둔 곳이 멈춘 줄 모른다(알라딘 키 없음, Amazon 확인 화면 등).
  const failures = sources.flatMap((source) => {
    const latest = source.recentRuns[0]
    return source.enabled && latest && !latest.isCollected && latest.message ? [`${source.label}: ${latest.message}`] : []
  })

  return (
    <>
      <h1 className={console.pageTitle}>책 수집처</h1>
      <div className={shared.formRow} style={{ justifyContent: 'flex-end' }}>
        <CollectBooksButton />
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
              <th className={shared.tableHead}>쌓인 책</th>
              <th className={shared.tableHead}>마지막 수집</th>
              <th className={`${shared.tableHead} ${blogStyles.switchCell}`}>수집</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.key} className={source.enabled ? undefined : blogStyles.inactiveRow}>
                <td className={shared.tableCell}>
                  <span className={clubStyles.nameCell}>
                    <SourceIcon iconDirectory="book-source-icons" sourceKey={source.key} name={source.label} size={ICON_SIZE} />
                    <a href={source.homepageUrl} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  </span>
                </td>
                <td className={shared.tableCell}>
                  <a href={`/books?source=${source.key}`}>{source.bookCount.toLocaleString()}권</a>
                </td>
                <td className={shared.tableCell}>{describeRun(source.recentRuns[0])}</td>
                <td className={`${shared.tableCell} ${blogStyles.switchCell}`}>
                  <BookSourceSwitch sourceKey={source.key} name={source.label} enabled={source.enabled} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
