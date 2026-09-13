'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}

/** 목록이 바뀌는 화면을 모두 새로 그리게 한다. 공고 하나가 대기·공개 두 목록을 오간다. */
function revalidateJobScreens() {
  revalidatePath('/jobs')
  revalidatePath('/jobs/published')
}

/**
 * 고른 공고를 사이트에 올린다.
 *
 * 여러 건을 한 번에 보내는 이유는 글 공개와 같다 — collector 반영(커밋) 한 번이 사이트 배포 한 번이다.
 */
export async function publishJobs(jobIds: string[]): Promise<ActionResult> {
  await requireAdmin()

  try {
    const result = await collector.publishJobs(jobIds)
    revalidateJobScreens()
    return { ok: true, message: `공고 ${result.affectedJobCount}건을 공개했습니다. 곧 사이트에 반영됩니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/** 올리지 않기로 한 공고를 치운다. 다시 수집돼도 대기로 돌아오지 않는다. */
export async function rejectJobs(jobIds: string[]): Promise<ActionResult> {
  await requireAdmin()

  try {
    const result = await collector.rejectJobs(jobIds)
    revalidateJobScreens()
    return { ok: true, message: `공고 ${result.affectedJobCount}건을 치웠습니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/** 사이트에 올린 공고를 내린다. */
export async function unpublishJobs(jobIds: string[]): Promise<ActionResult> {
  await requireAdmin()

  try {
    const result = await collector.unpublishJobs(jobIds)
    revalidateJobScreens()
    return { ok: true, message: `공고 ${result.affectedJobCount}건을 사이트에서 내렸습니다. 곧 사이트에 반영됩니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
