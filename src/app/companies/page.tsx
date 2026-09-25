import { collector, type CompanyRepository, type CompanySummary } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import { Result } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as chart from '../repositories/repositories.css'
import { CompanySelect } from './CompanySelect'
import * as styles from './companies.css'

export const dynamic = 'force-dynamic'

const dateFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric' })

/**
 * 회사 로고. GitHub 조직 프로필 이미지를 쓴다 — 회사들이 조직 프로필에 로고를 올려 두어서 따로 받아 둘 것이 없다.
 * 크기는 2배로 받아 레티나에서 흐리지 않게 한다.
 *
 * avatars.githubusercontent.com/{login} 이 아니라 github.com/{login}.png 다 — 앞의 것은 당근·라인 등 8곳에서
 * 로고 대신 기본 그림을 줬다(2026-09-25). 뒤의 것은 조직의 실제 이미지(u/{id})로 넘겨 준다.
 */
function organizationLogo(login: string): string {
  return `https://github.com/${encodeURIComponent(login)}.png?size=64`
}

function formatDate(value: string | null): string {
  return value ? dateFormat.format(new Date(value)) : '—'
}

/**
 * 주요 회사가 GitHub 에 공개한 저장소. 위는 회사 목록(전체 별 순), 아래는 고른 회사의 저장소(별 순).
 * collector 가 매일 07:50 에 조직마다 공개 저장소(포크 제외)를 모은다.
 *
 * 고른 회사는 주소(?org=)에 둔다 — 새로 고치거나 링크로 들어와도 보던 회사가 그대로 열린다.
 */
export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  await requireAdmin()

  let summaries: CompanySummary[]
  try {
    summaries = await collector.listCompanySummaries()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>회사 저장소</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  const requested = (await searchParams).org
  const selected = summaries.find((summary) => summary.login === requested) ?? summaries.find((summary) => summary.repositoryCount > 0)
  const repositories: CompanyRepository[] = selected && selected.repositoryCount > 0
    ? await collector.listCompanyRepositories(selected.login)
    : []

  return (
    <>
      <h1 className={console.pageTitle}>회사 저장소 · {summaries.length}곳</h1>

      {/* 회사가 스무 곳을 넘어 카드로 늘어놓으면 화면 절반을 차지한다. 칩 하나를 눌러 고르게 둔다. */}
      <div className={styles.filterBar}>
        <CompanySelect
          companies={summaries.map(({ login, company }) => ({ login, company }))}
          selectedLogin={selected?.login ?? null}
        />
      </div>

      {selected && (
        <>
          <h2 className={styles.sectionTitle}>
            <img className={styles.companyLogo} src={organizationLogo(selected.login)} alt="" width={28} height={28} />
            {selected.company} 저장소
            <span className={shared.mutedText}> · {formatDate(selected.collectedAt)} 수집 · 별이 많은 순</span>
          </h2>
          {repositories.length === 0 ? (
            <div className={shared.card}>
              <Result
                figure={<img src="/illustrations/empty.png" alt="" width={100} height={100} />}
                title="아직 모은 저장소가 없어요"
                description={'매일 07:50에 GitHub에서 회사 저장소를 모아요.\n첫 수집이 끝나면 여기에 나와요.'}
              />
            </div>
          ) : (
            <ol className={shared.card} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {repositories.map((repository, index) => (
                <li key={repository.fullName} className={chart.row}>
                  <div className={chart.rankCell}>
                    <span className={chart.rank}>{index + 1}</span>
                  </div>
                  <div className={chart.body}>
                    <a className={chart.name} href={repository.url} target="_blank" rel="noreferrer">
                      <span className={chart.repositoryName}>{repository.name}</span>
                      {repository.isArchived && <span className={styles.archived}> 보관됨</span>}
                    </a>
                    {repository.description && <p className={chart.description}>{repository.description}</p>}
                    {repository.language && <p className={chart.meta}>{repository.language}</p>}
                  </div>
                  <div className={chart.gained}>
                    <div className={chart.gainedCount}>★ {repository.stars.toLocaleString()}</div>
                    <div className={chart.gainedLabel}>포크 {repository.forks.toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </>
  )
}
