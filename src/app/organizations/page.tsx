import { listOrganizationRepositories, POPULAR_ORGANIZATIONS, type OrganizationRepository, type PopularOrganization } from '@/lib/popularOrganizations'
import { requireAdmin } from '@/lib/session'
import { Result } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as chart from '../repositories/repositories.css'
import { OrganizationSelect } from './OrganizationSelect'
import * as styles from './organizations.css'

export const dynamic = 'force-dynamic'

/** 조직 로고. 회사 저장소 화면과 같은 까닭으로 github.com/{login}.png 를 2배 크기로 받는다. */
function organizationLogo(login: string): string {
  return `https://github.com/${encodeURIComponent(login)}.png?size=64`
}

/**
 * 많이 쓰는 라이브러리를 내놓는 조직(Meta·Vercel·Spring 등)과 그 아래 저장소를 별 순으로 소개한다.
 * 인기 저장소 차트가 "요즘 뜨는 저장소 하나하나"라면, 여기는 "이름난 곳이 무엇을 내놓았나"를 본다.
 *
 * collector 를 거치지 않고 GitHub API 를 바로 부른다 — 조직 목록은 코드에 적어 둔 것이고, 쌓아 둘 이력도 없다.
 * 고른 조직은 주소(?org=)에 둔다.
 */
export default async function OrganizationsPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  await requireAdmin()

  const requested = (await searchParams).org
  const selected: PopularOrganization = POPULAR_ORGANIZATIONS.find((organization) => organization.login === requested) ?? POPULAR_ORGANIZATIONS[0]

  let repositories: OrganizationRepository[] = []
  let errorMessage: string | null = null
  try {
    repositories = await listOrganizationRepositories(selected.login)
  } catch (error) {
    errorMessage = (error as Error).message
  }

  return (
    <>
      <h1 className={console.pageTitle}>유명 저장소</h1>

      <div className={styles.filterBar}>
        <OrganizationSelect
          organizations={POPULAR_ORGANIZATIONS.map(({ login, name }) => ({ login, name }))}
          selectedLogin={selected.login}
        />
      </div>

      <h2 className={styles.sectionTitle}>
        <img className={styles.organizationLogo} src={organizationLogo(selected.login)} alt="" width={28} height={28} />
        <a className={chart.repositoryName} href={`https://github.com/${selected.login}`} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
          {selected.name}
        </a>
        <span className={shared.mutedText}> · github.com/{selected.login} · 별이 많은 순</span>
      </h2>
      <p className={styles.summary}>{selected.summary}</p>

      {errorMessage ? (
        <p className={shared.errorNotice}>{errorMessage}</p>
      ) : repositories.length === 0 ? (
        <div className={shared.card}>
          <Result
            figure={<img src="/illustrations/empty.png" alt="" width={100} height={100} />}
            title="공개 저장소가 없어요"
            description="GitHub 에서 이 조직의 공개 저장소를 찾지 못했어요."
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
                {(repository.language || repository.topics.length > 0) && (
                  <p className={chart.meta}>
                    {[repository.language, ...repository.topics.slice(0, 4).map((topic) => `#${topic}`)].filter(Boolean).join(' · ')}
                  </p>
                )}
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
  )
}
