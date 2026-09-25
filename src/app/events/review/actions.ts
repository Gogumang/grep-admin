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

/** 행사 하나가 검증·행사 일정 두 화면을 오간다. */
function revalidateEventScreens() {
  revalidatePath('/events/review')
  revalidatePath('/events')
}

/** 고른 행사를 사이트 후보 목록에 올린다. collector 가 곧장 events.json 을 다시 쓴다(커밋 한 번). */
export async function approveEvents(eventIds: string[]): Promise<ActionResult> {
  await requireAdmin()
  try {
    const result = await collector.approveEvents(eventIds)
    revalidateEventScreens()
    return { ok: true, message: `행사 ${result.affectedEventCount}건을 올렸습니다. 몇 분 안에 행사 일정에 나옵니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/** 올리지 않을 행사를 치운다. 다시 모여도 대기로 돌아오지 않는다. */
export async function rejectEvents(eventIds: string[]): Promise<ActionResult> {
  await requireAdmin()
  try {
    const result = await collector.rejectEvents(eventIds)
    revalidateEventScreens()
    return { ok: true, message: `행사 ${result.affectedEventCount}건을 치웠습니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
