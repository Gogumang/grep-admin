/**
 * 회사 정보 — collector 의 /api/admin/company-profiles 를 부르는 층. 서버에서만 쓴다(Server Components·Server Actions).
 * 요청 자체(토큰·세션·타임아웃)는 collector.ts 의 request 를 같이 쓴다.
 */
import { request } from './collector'
import type {
  CompanyCategory,
  CompanyProfile,
  CompanyProfileCollectionResult,
  CompanyProfileSummary,
  ProfiledCompany,
  ProfiledCompanyInput,
} from './companyProfiles'

const PROFILE_PATH = '/api/admin/company-profiles'

/** 한 회사 모으기는 DART·국민연금을 1년 치 부른다 — 첫 수집은 기본 제한보다 오래 걸린다. */
const COLLECT_TIMEOUT_MILLISECONDS = 60_000

function companyPath(companyId: string): string {
  return `${PROFILE_PATH}/${encodeURIComponent(companyId)}`
}

export const companyProfiles = {
  /** 묶음 순서, 그 안에서 이름 순. */
  list: () => request<CompanyProfileSummary[]>(PROFILE_PATH),

  categories: () => request<CompanyCategory[]>(`${PROFILE_PATH}/categories`),

  /** 없으면 company_profile_not_found 로 실패한다. */
  get: (companyId: string) => request<CompanyProfile>(companyPath(companyId)),

  /** 같은 id 가 있으면 company_profile_exists 로 실패한다 — 덮어쓰지 않는다. */
  add: (input: ProfiledCompanyInput) =>
    request<ProfiledCompany>(PROFILE_PATH, { method: 'POST', body: JSON.stringify(input) }),

  update: (input: ProfiledCompanyInput) =>
    request<ProfiledCompany>(companyPath(input.id), { method: 'PUT', body: JSON.stringify(input) }),

  /** 모은 인원·손익도 함께 지워진다. */
  remove: (companyId: string) => request<void>(companyPath(companyId), { method: 'DELETE' }),

  collect: (companyId: string) =>
    request<CompanyProfileCollectionResult>(
      `${companyPath(companyId)}/collect`,
      { method: 'POST' },
      COLLECT_TIMEOUT_MILLISECONDS,
    ),
}
