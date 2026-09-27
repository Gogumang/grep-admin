import { companyProfiles } from '@/lib/companyProfileClient'
import type { CompanyCategory, CompanyProfile } from '@/lib/companyProfiles'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { CompanyProfileForm } from '../../CompanyProfileForm'
import * as styles from '../../companyProfiles.css'

export const dynamic = 'force-dynamic'

/** 회사 하나의 연결 설정. 고치고, 지금 모으고, 목록에서 뺀다. */
export default async function CompanySettingsPage({ params }: { params: Promise<{ companyId: string }> }) {
  await requireAdmin()
  const { companyId } = await params

  let profile: CompanyProfile
  let categories: CompanyCategory[]
  try {
    ;[profile, categories] = await Promise.all([companyProfiles.get(companyId), companyProfiles.categories()])
  } catch (error) {
    return (
      <>
        <a className={styles.backLink} href="/company-profiles/companies">← 회사 목록</a>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  return (
    <>
      <a className={styles.backLink} href="/company-profiles/companies">← 회사 목록</a>
      <div className={styles.titleRow}>
        <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>{profile.company.name} 연결 설정</h1>
        <a className={`${styles.hint} ${styles.pushRight}`} href={`/company-profiles/${encodeURIComponent(companyId)}`}>
          회사 정보 보기 →
        </a>
      </div>
      <p className={styles.lead}>
        직원 수가 &lsquo;확인 안 됨&rsquo;이면 국민연금 검색어(법인 등록 이름)나 사업자번호 앞 6자리를 적고 지금 모으기를 누르세요.
      </p>
      <CompanyProfileForm categories={categories} company={profile.company} />
    </>
  )
}
