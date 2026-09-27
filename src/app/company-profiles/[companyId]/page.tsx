import { companyProfiles } from '@/lib/companyProfileClient'
import {
  financialsUnverifiedReason,
  formatCount,
  formatShortMonth,
  HEADCOUNT_UNVERIFIED_REASON,
  UNVERIFIED,
  type AnnualFinancials,
  type CompanyOverview,
  type CompanyProfile,
} from '@/lib/companyProfiles'
import { requireAdmin } from '@/lib/session'
import { BarChart } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { YearlyAmountChart } from '../YearlyAmountChart'
import * as styles from '../companyProfiles.css'

export const dynamic = 'force-dynamic'

const DART_OVERVIEW_UNVERIFIED_REASON = 'DART 공시가 없는 회사이거나 아직 모으지 않았습니다.'

/** 섹션이 통째로 비었을 때. "확인 안 됨" 표시와 이유를 한 줄로. */
function UnverifiedNotice({ reason }: { reason: string }) {
  return (
    <p className={`${shared.card} ${styles.unverifiedNotice}`}>
      <span className={styles.unverifiedTag}>{UNVERIFIED}</span>
      {reason}
    </p>
  )
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
            <dd className={styles.overviewValue}>{value ?? <span className={styles.hint}>{UNVERIFIED}</span>}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/**
 * 매출·영업이익·순이익을 그래프 셋으로 나눠 연도별로 — 셋은 크기가 달라(조 단위 매출, 억 단위 이익) 한 축에 두면 이익이 바닥에 붙는다.
 * 모은 해 사이에 빈 해가 있으면 그 해도 칸을 두고 "확인 안 됨"으로 채운다 — 건너뛰면 추세가 이어진 것처럼 보인다.
 */
function FinancialCharts({ financials }: { financials: AnnualFinancials[] }) {
  const byYear = new Map(financials.map((financial) => [financial.fiscalYear, financial]))
  const first = Math.min(...byYear.keys())
  const last = Math.max(...byYear.keys())
  const years = Array.from({ length: last - first + 1 }, (_, index) => first + index)
  const series = (pick: (financial: AnnualFinancials) => number | null) =>
    years.map((fiscalYear) => {
      const financial = byYear.get(fiscalYear)
      return { fiscalYear, amount: financial ? pick(financial) : null }
    })

  return (
    <>
      <div className={styles.chartGrid}>
        <YearlyAmountChart title="매출" points={series((financial) => financial.revenue)} />
        <YearlyAmountChart title="영업이익" points={series((financial) => financial.operatingIncome)} />
        <YearlyAmountChart title="당기순이익" points={series((financial) => financial.netIncome)} />
      </div>
      <p className={styles.hint} style={{ marginTop: 8 }}>
        {byYear.get(last)?.isConsolidated ? '연결재무제표' : '별도재무제표'} 기준. 적자는 0 선 아래로 내려가고 금액 앞에 &lsquo;-&rsquo;가 붙습니다.
      </p>
    </>
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

/** 회사 하나. 위에서부터 "돈을 버나 → 사람이 드나드나 → 어떤 회사인가". 연결 설정은 회사 목록 화면에서 고친다. */
export default async function CompanyProfilePage({ params }: { params: Promise<{ companyId: string }> }) {
  await requireAdmin()
  const { companyId } = await params

  let profile: CompanyProfile
  try {
    profile = await companyProfiles.get(companyId)
  } catch (error) {
    return (
      <>
        <a className={styles.backLink} href="/company-profiles">← 회사 검색</a>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  const { company, overview } = profile
  const financials = profile.financials.filter(
    (financial) => financial.revenue !== null || financial.operatingIncome !== null || financial.netIncome !== null,
  )
  return (
    <>
      <a className={styles.backLink} href="/company-profiles">← 회사 검색</a>
      <div className={styles.titleRow}>
        <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>{company.name}</h1>
        {overview && <span className={shared.mutedText}>{overview.corporationName}</span>}
        <a className={`${styles.hint} ${styles.pushRight}`} href={`/company-profiles/companies/${encodeURIComponent(company.id)}`}>
          연결 설정 고치기 →
        </a>
      </div>

      <h2 className={styles.sectionTitle}>연도별 손익 (DART 사업보고서)</h2>
      {financials.length === 0 ? <UnverifiedNotice reason={financialsUnverifiedReason(company)} /> : <FinancialCharts financials={financials} />}

      <h2 className={styles.sectionTitle}>직원 수 (국민연금, 최근 12개월)</h2>
      {profile.headcounts.length === 0 ? (
        <UnverifiedNotice reason={HEADCOUNT_UNVERIFIED_REASON} />
      ) : (
        <>
          <HeadcountChart profile={profile} />
          <h2 className={styles.sectionTitle}>월별 입사·퇴사</h2>
          <HeadcountTable profile={profile} />
        </>
      )}

      <h2 className={styles.sectionTitle}>기업개황 (DART)</h2>
      {overview ? <OverviewCard overview={overview} /> : <UnverifiedNotice reason={DART_OVERVIEW_UNVERIFIED_REASON} />}

      {profile.collectedAt && (
        <p className={styles.hint} style={{ marginTop: 16 }}>
          {new Date(profile.collectedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}에 모았습니다.
        </p>
      )}
    </>
  )
}
