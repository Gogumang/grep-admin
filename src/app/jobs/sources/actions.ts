'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) {
    // 응답 대기 시간이 넘은 것과 collector 가 꺼진 것을 여기서는 가를 수 없다. 전체 수집은 몇 분 걸려
    // 앞의 경우가 흔하고, 그때 collector 는 수집을 끝까지 마친다.
    if (error.code === 'collector_unreachable') {
      return 'collector 응답을 받지 못했습니다. 전체 수집이 길어 기다리다 끊겼을 수 있어요 — 몇 분 뒤 채용 검증을 확인하고, 계속되면 서버 상태를 확인해 주세요.'
    }
    return error.message
  }
  return `알 수 없는 오류: ${(error as Error).message}`
}


/** 채용 화면들을 다시 그린다 — 새 공고는 검증 대기로 들어간다. */
function revalidateJobScreens() {
  revalidatePath('/jobs')
  revalidatePath('/jobs/sources')
}

/** 모든 회사의 공고를 지금 다시 받는다. 매일 08:00 에 DAG 가 하는 일을 기다리지 않고 한 번 돌린다. */
export async function collectAllJobs(): Promise<ActionResult> {
  await requireAdmin()
  try {
    const result = await collector.collectAllJobs()
    revalidateJobScreens()
    const failed = result.failedCompanies.length > 0 ? `, 실패 ${result.failedCompanies.join('·')}` : ''
    return {
      ok: result.failedCompanies.length === 0,
      message: `${result.companyCount}곳에서 새 공고 ${result.addedCount}건, 닫힌 공고 ${result.closedCount}건${failed}. 새 공고는 채용 검증에 있습니다.`,
    }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
