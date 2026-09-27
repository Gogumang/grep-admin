'use server'

import { revalidatePath } from 'next/cache'
import { CollectorRequestError } from '@/lib/collector'
import { companyProfiles } from '@/lib/companyProfileClient'
import type { CompanyProfileCollectionResult, ProfiledCompanyInput } from '@/lib/companyProfiles'
import { requireAdmin } from '@/lib/session'

export interface CompanyProfileActionResult {
  ok: boolean
  message: string
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}

/** 모으기 결과를 한 줄로. 비어 있는 것(notes)도 알려야 사람이 검색어·사업자번호를 고친다. */
function describeCollection(result: CompanyProfileCollectionResult): string {
  const parts = [
    `새 달 ${result.headcountMonthsAdded}개`,
    result.financialYears.length > 0 ? `손익 ${result.financialYears.join('·')}` : '손익 없음',
  ]
  const problems = [...result.errors, ...result.notes]
  return problems.length > 0 ? `${parts.join(', ')} — ${problems.join(' / ')}` : `${parts.join(', ')}를 모았습니다.`
}

/**
 * 회사를 목록에 더하고 바로 한 번 모은다 — 더해 놓고 월요일까지 빈 줄로 두면 연결이 맞는지 알 수 없다.
 * 모으기가 실패해도 회사는 더해진 채로 둔다. 실패 내용을 보고 설정을 고치면 된다.
 */
export async function addCompanyProfile(input: ProfiledCompanyInput): Promise<CompanyProfileActionResult> {
  await requireAdmin()

  try {
    await companyProfiles.add(input)
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
  try {
    const result = await companyProfiles.collect(input.id)
    revalidatePath('/company-profiles')
    return { ok: true, message: `더했습니다. ${describeCollection(result)}` }
  } catch (error) {
    revalidatePath('/company-profiles')
    return { ok: true, message: `더했지만 모으지 못했습니다: ${describe(error)}` }
  }
}

export async function updateCompanyProfile(input: ProfiledCompanyInput): Promise<CompanyProfileActionResult> {
  await requireAdmin()

  try {
    await companyProfiles.update(input)
    revalidatePath('/company-profiles')
    revalidatePath(`/company-profiles/${input.id}`)
    return { ok: true, message: '저장했습니다. 바뀐 연결로 보려면 지금 모으기를 누르세요.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

export async function collectCompanyProfile(companyId: string): Promise<CompanyProfileActionResult> {
  await requireAdmin()

  try {
    const result = await companyProfiles.collect(companyId)
    revalidatePath('/company-profiles')
    revalidatePath(`/company-profiles/${companyId}`)
    return { ok: result.errors.length === 0, message: describeCollection(result) }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

export async function removeCompanyProfile(companyId: string): Promise<CompanyProfileActionResult> {
  await requireAdmin()

  try {
    await companyProfiles.remove(companyId)
    revalidatePath('/company-profiles')
    return { ok: true, message: '목록에서 뺐습니다.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
