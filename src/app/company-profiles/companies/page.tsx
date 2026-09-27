import { companyProfiles } from '@/lib/companyProfileClient'
import type { CompanyCategory, CompanyProfileSummary } from '@/lib/companyProfiles'
import { requireAdmin } from '@/lib/session'
import { CompanyIcon } from '@/components/CompanyIcon'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { AddCompanyButton } from '../AddCompanyButton'
import * as styles from '../companyProfiles.css'

export const dynamic = 'force-dynamic'

/** 비어 있는 설정은 "자동"이다 — DART 번호가 있으면 사업자번호·검색어는 거기서 찾는다. */
function Setting({ value, emptyLabel = '자동' }: { value: string | null; emptyLabel?: string }) {
  return value === null ? <span className={styles.hint}>{emptyLabel}</span> : <code>{value}</code>
}

/**
 * 회사 목록 — 어떤 회사를 모을지 고른다. 정보를 보는 곳은 '회사 정보'(검색) 화면이다.
 *
 * 줄에는 로고·이름·DART 고유번호만 둔다(2026-09-28 사업자번호·국민연금 검색어·모은 결과 열을 뺐다).
 * 연결이 틀려 직원 수가 "확인 안 됨"이면 수정으로 들어가 사업자번호·검색어를 적는다.
 */
export default async function CompanyListPage() {
  await requireAdmin()

  let summaries: CompanyProfileSummary[]
  let categories: CompanyCategory[]
  try {
    ;[summaries, categories] = await Promise.all([companyProfiles.list(), companyProfiles.categories()])
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>회사 목록</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  const sorted = [...summaries].sort((left, right) => left.company.name.localeCompare(right.company.name, 'ko'))
  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>회사 목록 {summaries.length}곳</h1>
        <div className={styles.pushRight}>
          <AddCompanyButton categories={categories} />
        </div>
      </div>
      <p className={styles.lead}>
        월요일마다 이 회사들의 국민연금 인원과 DART 손익을 모읍니다. 새 회사는 오른쪽 위 '회사 더하기'로 더하면 바로 한 번 모읍니다.
      </p>

      <div className={`${shared.card} ${styles.tableScroller}`}>
        <table className={shared.table}>
          <thead>
            <tr>
              <th className={shared.tableHead}>회사</th>
              <th className={shared.tableHead}>DART 고유번호</th>
              <th className={shared.tableHead} />
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ company, corporationName }) => (
              <tr key={company.id}>
                <td className={shared.tableCell}>
                  <div className={styles.companyNameCell}>
                    <CompanyIcon companyKey={company.id} name={company.name} size={28} />
                    <div>
                      <a className={styles.companyLink} href={`/company-profiles/${encodeURIComponent(company.id)}`}>
                        {company.name}
                      </a>
                      {corporationName && <div className={styles.hint}>{corporationName}</div>}
                    </div>
                  </div>
                </td>
                <td className={shared.tableCell}>
                  <Setting value={company.dartCorpCode} emptyLabel="공시 없음" />
                </td>
                <td className={`${shared.tableCell} ${shared.actionCell}`}>
                  <a className={styles.companyLink} href={`/company-profiles/companies/${encodeURIComponent(company.id)}`}>
                    수정
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
