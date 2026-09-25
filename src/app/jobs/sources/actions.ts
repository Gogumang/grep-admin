'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

/** 회사 하나를 수집한 결과. 진행 화면의 한 줄이 된다. */
export interface CompanyCollectOutcome {
  companyKey: string
  ok: boolean
  addedCount: number
  message: string
}

/**
 * 회사 하나의 공고를 지금 다시 받는다. 수집처 화면이 회사를 하나씩 차례로 불러 어디를 돌고 있는지 보여 준다.
 * 실패는 던지지 않고 결과에 담는다 — 한 곳이 막혀도 다음 회사로 넘어가야 한다.
 */
export async function collectCompanyJobs(companyKey: string): Promise<CompanyCollectOutcome> {
  await requireAdmin()
  try {
    const result = await collector.collectCompanyJobs(companyKey)
    if (result.failureMessage) {
      return { companyKey, ok: false, addedCount: 0, message: result.failureMessage }
    }
    const closed = result.closedCount > 0 ? ` · 닫힘 ${result.closedCount}건` : ''
    const message = result.skippedEmpty
      ? '읽은 개발 공고 없음 (기존 공고는 그대로)'
      : `공고 ${result.fetchedCount}건 · 새 공고 ${result.addedCount}건${closed}`
    return { companyKey, ok: true, addedCount: result.addedCount, message }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : `알 수 없는 오류: ${(error as Error).message}`
    return { companyKey, ok: false, addedCount: 0, message }
  }
}

/** 다 돈 뒤 한 번 부른다. 새 공고는 채용 검증에, 닫힌 공고는 공개한 공고에서 빠진다. */
export async function refreshJobScreens(): Promise<void> {
  await requireAdmin()
  revalidatePath('/jobs')
  revalidatePath('/jobs/published')
  revalidatePath('/jobs/sources')
}
