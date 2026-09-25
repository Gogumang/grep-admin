'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

/** 모집 일정을 자동으로 읽는 동아리(SOPT·디프만·DND·넥스터즈)를 지금 다시 읽는다. 매일 08:45 DAG 와 같은 일이다. */
export async function collectClubRecruitments(): Promise<ActionResult> {
  await requireAdmin()
  try {
    const checks = await collector.collectClubRecruitments()
    revalidatePath('/clubs')
    const failed = checks.filter((check) => !check.isOk).map((check) => check.clubKey)
    const found = checks.reduce((sum, check) => sum + check.foundCount, 0)
    return {
      ok: failed.length === 0,
      message: `${checks.length}곳에서 모집 일정 ${found}건을 읽었습니다${failed.length > 0 ? ` — 실패 ${failed.join('·')}` : ''}.`,
    }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : `알 수 없는 오류: ${(error as Error).message}`
    return { ok: false, message }
  }
}
