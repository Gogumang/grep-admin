import { companyProfiles } from '@/lib/companyProfileClient'
import {
  formatCount,
  formatShortMonth,
  formatWon,
  type CompanyCategory,
  type CompanyOverview,
  type CompanyProfile,
} from '@/lib/companyProfiles'
import { requireAdmin } from '@/lib/session'
import { BarChart } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { CompanyProfileForm } from '../CompanyProfileForm'
import * as styles from '../companyProfiles.css'

export const dynamic = 'force-dynamic'

function Money({ amount }: { amount: number | null }) {
  return <span className={amount !== null && amount < 0 ? styles.loss : undefined}>{formatWon(amount)}</span>
}

function OverviewCard({ overview }: { overview: CompanyOverview }) {
  const rows: [string, string | null][] = [
    ['법인명', overview.corporationName],
    ['대표', overview.representative],
    ['설립일', overview.establishedOn],
    ['사업자번호', overview.businessNumber],
    ['종목코드', overview.stockCode ?? '비상장'],
    ['업종코드', overview.industryCode],
    ['홈페이지', overview.homepage],
    ['주소', overview.address],
  ]
  return (
    <div className={shared.card}>
      <dl className={styles.overviewList}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'contents' }}>
            <dt className={styles.overviewLabel}>{label}</dt>
            <dd className={styles.overviewValue}>{value ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/**
 * 월별 직원 수. 막대는 0 에서 시작한다 — 1,769명과 1,774명의 차이를 부풀리지 않는다.
 * 숫자는 처음·마지막 달에만 얹고 나머지는 마우스를 올려 본다. 입사·퇴사는 단위가 달라 아래 표로 둔다(축 두 개 금지).
 */
function HeadcountChart({ profile }: { profile: CompanyProfile }) {
  const last = profile.headcounts.length - 1
  return (
    <div className={shared.card}>
      <BarChart
        fill={{ type: 'single-bar', barIndex: last, theme: 'blue' }}
        data={profile.headcounts.map((headcount, index) => ({
          value: headcount.employeeCount,
          label: formatShortMonth(headcount.yearMonth),
          barAnnotation: index === 0 || index === last ? formatCount(headcount.employeeCount) : undefined,
          title: `${headcount.yearMonth} 직원 ${formatCount(headcount.employeeCount)}명 · 입사 ${headcount.hiredCount} · 퇴사 ${headcount.leftCount}`,
        }))}
      />
    </div>
  )
}

function HeadcountTable({ profile }: { profile: CompanyProfile }) {
  // 최근 달이 위로. 사람은 "지난달 몇 명 나갔나"부터 본다.
  const newestFirst = [...profile.headcounts].reverse()
  return (
    <div className={`${shared.card} ${styles.tableScroller}`}>
      <table className={shared.table}>
        <thead>
          <tr>
            <th className={shared.tableHead}>달</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>직원 수</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>입사</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>퇴사</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>순증</th>
          </tr>
        </thead>
        <tbody>
          {newestFirst.map((headcount) => {
            const net = headcount.hiredCount - headcount.leftCount
            return (
              <tr key={headcount.yearMonth}>
                <td className={shared.tableCell}>{headcount.yearMonth}</td>
                <td className={`${shared.tableCell} ${styles.numberCell}`}>{formatCount(headcount.employeeCount)}</td>
                <td className={`${shared.tableCell} ${styles.numberCell}`}>{formatCount(headcount.hiredCount)}</td>
                <td className={`${shared.tableCell} ${styles.numberCell}`}>{formatCount(headcount.leftCount)}</td>
                <td className={`${shared.tableCell} ${styles.numberCell}`}>
                  <span className={net < 0 ? styles.loss : undefined}>{net > 0 ? `+${net}` : net}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function FinancialsTable({ profile }: { profile: CompanyProfile }) {
  const newestFirst = [...profile.financials].reverse()
  return (
    <div className={`${shared.card} ${styles.tableScroller}`}>
      <table className={shared.table}>
        <thead>
          <tr>
            <th className={shared.tableHead}>사업연도</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>매출</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>영업이익</th>
            <th className={`${shared.tableHead} ${styles.numberHead}`}>당기순이익</th>
            <th className={shared.tableHead}>기준</th>
          </tr>
        </thead>
        <tbody>
          {newestFirst.map((financials) => (
            <tr key={financials.fiscalYear}>
              <td className={shared.tableCell}>{financials.fiscalYear}</td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}><Money amount={financials.revenue} /></td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}><Money amount={financials.operatingIncome} /></td>
              <td className={`${shared.tableCell} ${styles.numberCell}`}><Money amount={financials.netIncome} /></td>
              <td className={`${shared.tableCell} ${styles.hint}`}>{financials.isConsolidated ? '연결' : '별도'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** 회사 하나. 기업개황 → 직원 추이 → 손익 → 연결 설정 순서 — 위에서부터 "어떤 회사인가 → 사람이 드나드나 → 돈을 버나". */
export default async function CompanyProfilePage({ params }: { params: Promise<{ companyId: string }> }) {
  await requireAdmin()
  const { companyId } = await params

  let profile: CompanyProfile
  let categories: CompanyCategory[]
  try {
    ;[profile, categories] = await Promise.all([companyProfiles.get(companyId), companyProfiles.categories()])
  } catch (error) {
    return (
      <>
        <a className={styles.backLink} href="/company-profiles">← 회사 정보</a>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  const { company, overview } = profile
  return (
    <>
      <a className={styles.backLink} href="/company-profiles">← 회사 정보</a>
      <div className={styles.titleRow}>
        <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>{company.name}</h1>
        <span className={shared.mutedText}>
          {company.categoryLabel}
          {profile.collectedAt && ` · ${new Date(profile.collectedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })} 모음`}
        </span>
      </div>

      <h2 className={styles.sectionTitle}>기업개황 (DART)</h2>
      {overview ? (
        <OverviewCard overview={overview} />
      ) : (
        <p className={shared.mutedText}>DART 공시가 없는 회사이거나 아직 모으지 않았습니다.</p>
      )}

      <h2 className={styles.sectionTitle}>직원 수 (국민연금)</h2>
      {profile.headcounts.length === 0 ? (
        <p className={shared.mutedText}>아직 모은 달이 없습니다. 아래에서 지금 모으기를 누르세요.</p>
      ) : (
        <>
          <HeadcountChart profile={profile} />
          <h2 className={styles.sectionTitle}>월별 입사·퇴사</h2>
          <HeadcountTable profile={profile} />
        </>
      )}

      <h2 className={styles.sectionTitle}>손익 (DART 사업보고서)</h2>
      {profile.financials.length === 0 ? (
        <p className={shared.mutedText}>
          DART 에 구조화된 재무제표가 없습니다 — 감사보고서만 내는 회사는 공시 원문에서 읽어야 합니다.
        </p>
      ) : (
        <FinancialsTable profile={profile} />
      )}

      <h2 className={styles.sectionTitle}>연결 설정</h2>
      <CompanyProfileForm categories={categories} company={company} />
    </>
  )
}
