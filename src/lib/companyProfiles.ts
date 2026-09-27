/**
 * 회사 정보의 타입과 표기. 클라이언트 컴포넌트(설정 폼)도 읽으므로 collector 를 부르는 층(companyProfileClient.ts)과 나눈다 —
 * 그쪽은 서버 전용(토큰·기기 세션)이라 클라이언트 번들에 끌려 들어가면 빌드가 막힌다.
 */

export interface CompanyCategory {
  id: string
  label: string
}

export interface ProfiledCompany {
  /** 주소에 쓰는 키 (toss, kakao-bank). */
  id: string
  /** 사람들이 부르는 이름 (토스). */
  name: string
  category: string
  categoryLabel: string
  /** DART 고유번호 8자리. 공시가 없는 회사는 null. */
  dartCorpCode: string | null
  /** 국민연금을 좁히는 사업자번호 앞 6자리. null 이면 DART 기업개황의 값을 쓴다. */
  businessNumberPrefix: string | null
  /** 국민연금 사업장 이름 검색어. null 이면 DART 법인명·화면 이름 순으로 찾는다. */
  pensionSearchName: string | null
}

export interface MonthlyHeadcount {
  /** YYYY-MM */
  yearMonth: string
  employeeCount: number
  hiredCount: number
  leftCount: number
}

/** 금액은 원 단위. 없는 항목은 null 이다 — 0 이 아니다(은행은 매출액 계정이 없다). */
export interface AnnualFinancials {
  fiscalYear: number
  isConsolidated: boolean
  revenue: number | null
  operatingIncome: number | null
  netIncome: number | null
}

export interface CompanyOverview {
  corporationName: string
  representative: string | null
  businessNumber: string | null
  stockCode: string | null
  /** YYYY-MM-DD */
  establishedOn: string | null
  industryCode: string | null
  homepage: string | null
  address: string | null
}

export interface CompanyProfileSummary {
  company: ProfiledCompany
  /** DART 법인명 (비바리퍼블리카). 공시가 없거나 아직 못 모았으면 null. 검색에 함께 쓴다. */
  corporationName: string | null
  latestHeadcount: MonthlyHeadcount | null
  /** 가장 최근 달부터 12개월 합. 받은 달이 없으면 null. */
  hiredLastYear: number | null
  leftLastYear: number | null
  latestFinancials: AnnualFinancials | null
  /** ISO-8601 */
  collectedAt: string | null
}

export interface CompanyProfile {
  company: ProfiledCompany
  overview: CompanyOverview | null
  /** 오래된 달부터. */
  headcounts: MonthlyHeadcount[]
  /** 오래된 해부터. */
  financials: AnnualFinancials[]
  collectedAt: string | null
}

/** 회사를 더하거나 고칠 때 보내는 모양. 빈 문자열은 collector 가 없음으로 받는다. */
export interface ProfiledCompanyInput {
  id: string
  name: string
  category: string
  dartCorpCode: string
  businessNumberPrefix: string
  pensionSearchName: string
}

/** 모으기 한 번의 결과. errors 는 읽다 실패한 것, notes 는 실패는 아니지만 비어 있는 것. */
export interface CompanyProfileCollectionResult {
  companyId: string
  company: string
  hasOverview: boolean
  financialYears: number[]
  headcountMonthsAdded: number
  errors: string[]
  notes: string[]
}

/** 값을 얻지 못한 칸. 0 으로 두면 "매출 0원"·"아무도 안 나갔다"로 읽힌다. */
export const UNVERIFIED = '확인 안 됨'

/** 손익이 통째로 없는 이유. 공시가 아예 없는 회사와, 공시는 있지만 구조화 재무제표가 없는 회사를 나눈다. */
export function financialsUnverifiedReason(company: ProfiledCompany): string {
  return company.dartCorpCode === null
    ? 'DART 공시가 없는 회사입니다 (외부감사 대상이 아님).'
    : 'DART 에 구조화된 재무제표가 없습니다 — 감사보고서만 내는 회사는 공시 원문을 읽어야 해서 아직 비어 있습니다.'
}

/** 손익은 있는데 한 항목만 없을 때. 은행·증권은 매출액 계정이 없다. */
export const MISSING_ACCOUNT_REASON = '이 회사 재무제표에 해당 계정이 없습니다 (은행·증권 등).'

export const HEADCOUNT_UNVERIFIED_REASON = '국민연금에서 사업장을 찾지 못했거나 아직 모으지 않았습니다.'

/** 법인 표기·빈칸·대소문자를 걷는다 — "(주)카카오"를 "카카오"로, "NAVER"를 "naver"로 찾게. */
function normalizeForSearch(text: string): string {
  return text.replace(/주식회사|\(주\)|（주）|㈜|\s/g, '').toLowerCase()
}

/** 화면 이름·법인명·id 중 하나라도 검색어를 품으면 맞는다. 빈 검색어는 아무것도 고르지 않는다. */
export function matchesCompanySearch(summary: CompanyProfileSummary, query: string): boolean {
  const needle = normalizeForSearch(query)
  if (needle === '') return false
  return [summary.company.name, summary.corporationName ?? '', summary.company.id].some((text) =>
    normalizeForSearch(text).includes(needle),
  )
}

const TRILLION = 1_000_000_000_000
const HUNDRED_MILLION = 100_000_000

/**
 * 원 단위 금액을 조·억으로 줄인다 (2.7조, 3,360억, -2,065억). 1억 아래는 만 원 단위로.
 * null 은 "확인 안 됨" — 0원과 구분돼야 한다.
 */
export function formatWon(amount: number | null): string {
  if (amount === null) return UNVERIFIED
  const sign = amount < 0 ? '-' : ''
  const absolute = Math.abs(amount)
  if (absolute >= TRILLION) return `${sign}${(absolute / TRILLION).toFixed(1)}조`
  if (absolute >= HUNDRED_MILLION) return `${sign}${Math.round(absolute / HUNDRED_MILLION).toLocaleString('ko-KR')}억`
  return `${sign}${Math.round(absolute / 10_000).toLocaleString('ko-KR')}만`
}

export function formatCount(count: number | null): string {
  return count === null ? UNVERIFIED : count.toLocaleString('ko-KR')
}

/** YYYY-MM → 26.08 (막대 이름표는 좁다). */
export function formatShortMonth(yearMonth: string): string {
  return `${yearMonth.slice(2, 4)}.${yearMonth.slice(5, 7)}`
}
