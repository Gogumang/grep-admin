import { companyProfiles } from '@/lib/companyProfileClient'
import type { CompanyProfileSummary } from '@/lib/companyProfiles'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { CompanySearch } from './CompanySearch'
import * as styles from './companyProfiles.css'

export const dynamic = 'force-dynamic'

/**
 * 회사 정보 — 이직을 고민할 때 한 회사를 찾아 본다. 검색하고, 고르면 그 회사 화면으로 간다.
 * 어떤 회사를 모을지는 따로 '회사 목록' 화면에서 고친다.
 */
export default async function CompanyProfilesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin()
  const initialQuery = (await searchParams).q ?? ''

  let summaries: CompanyProfileSummary[]
  try {
    summaries = await companyProfiles.list()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>회사 정보</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>회사 정보</h1>
      </div>
      <p className={styles.lead}>
        직원·입사·퇴사는 국민연금, 손익은 DART 사업보고서입니다. 얻지 못한 값은 &lsquo;확인 안 됨&rsquo;으로 두고, 마우스를 올리면 이유가 나옵니다.
      </p>
      <CompanySearch summaries={summaries} initialQuery={initialQuery} />
    </>
  )
}
