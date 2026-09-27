import { companyProfiles } from '@/lib/companyProfileClient'
import { formatCount, formatWon, type CompanyCategory, type CompanyProfileSummary } from '@/lib/companyProfiles'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { CompanyProfileForm } from './CompanyProfileForm'
import * as styles from './companyProfiles.css'

export const dynamic = 'force-dynamic'

/** 적자면 색과 '-' 부호가 함께 말한다 — 색만으로 말하지 않는다. */
function Money({ amount }: { amount: number | null }) {
  return <span className={amount !== null && amount < 0 ? styles.loss : undefined}>{formatWon(amount)}</span>
}

function SummaryTable({ summaries }: { summaries: CompanyProfileSummary[] }) {
  return (
    <div className={`${shared.card} ${styles.tableScroller}`}>
      <table className={shared.table}>
        <thead>
          <tr>
            <th className={shared.tableHead}>회사</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>직원 수</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>1년 입사</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>1년 퇴사</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>매출</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>영업이익</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>순이익</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map(({ company, latestHeadcount, hiredLastYear, leftLastYear, latestFinancials }) => (
            <tr key={company.id}>
              <td className={shared.tableCell}>
                <a className={styles.companyLink} href={`/company-profiles/${encodeURIComponent(company.id)}`}>
                  {company.name}
                </a>
              </td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}>
                {formatCount(latestHeadcount?.employeeCount ?? null)}
                {latestHeadcount && <div className={styles.hint}>{latestHeadcount.yearMonth}</div>}
              </td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}>{formatCount(hiredLastYear)}</td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}>{formatCount(leftLastYear)}</td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}>
                <Money amount={latestFinancials?.revenue ?? null} />
                {latestFinancials && <div className={styles.hint}>{latestFinancials.fiscalYear}년</div>}
              </td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}>
                <Money amount={latestFinancials?.operatingIncome ?? null} />
              </td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}>
                <Money amount={latestFinancials?.netIncome ?? null} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * 이직을 고민할 때 보는 회사 정보. 직원·입사·퇴사는 국민연금, 손익은 DART 사업보고서에서 온다.
 * collector 가 월요일마다 모은다. 목록은 사람이 고른다 — 아래 폼에서 더하고, 회사 화면에서 뺀다.
 *
 * 값이 없으면 "—" 다. 0 이 아니다 — 감사보고서만 내는 회사는 손익이 아직 없고, 은행은 매출액 계정이 없다.
 */
export default async function CompanyProfilesPage() {
  await requireAdmin()

  let summaries: CompanyProfileSummary[]
  let categories: CompanyCategory[]
  try {
    ;[summaries, categories] = await Promise.all([companyProfiles.list(), companyProfiles.categories()])
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>회사 정보</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  // 목록이 이미 묶음 순서로 온다. 순서를 지키며 묶음마다 나눈다.
  const groups = new Map<string, CompanyProfileSummary[]>()
  summaries.forEach((summary) => {
    const label = summary.company.categoryLabel
    groups.set(label, [...(groups.get(label) ?? []), summary])
  })
  const withFinancials = summaries.filter((summary) => summary.latestFinancials !== null).length

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>회사 정보 {summaries.length}곳</h1>
      </div>
      <p className={styles.lead}>
        직원·입사·퇴사는 국민연금(최근 달 기준, 입퇴사는 12개월 합), 손익은 DART 사업보고서(가장 최근 사업연도)입니다.
        손익이 있는 회사는 {withFinancials}곳 — 감사보고서만 내는 회사는 아직 비어 있습니다.
      </p>

      {[...groups.entries()].map(([label, members]) => (
        <section key={label}>
          <h2 className={styles.sectionTitle}>{label}</h2>
          <SummaryTable summaries={members} />
        </section>
      ))}

      <h2 className={styles.sectionTitle}>회사 더하기</h2>
      <CompanyProfileForm categories={categories} />
    </>
  )
}
