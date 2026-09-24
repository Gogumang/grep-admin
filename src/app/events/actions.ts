'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

/**
 * 행사를 이벤트 페이지에 올린다. 이미지를 받고 커밋하는 일은 collector가 한다 —
 * 이미지 주소가 쓸 만한지도 그쪽이 받아 보고 알려준다.
 */
export async function featureEvent(eventId: string, imageUrl: string): Promise<ActionResult> {
  await requireAdmin()

  try {
    await collector.featureEvent(eventId, imageUrl.trim())
    revalidatePath('/events')
    return { ok: true, message: '이벤트 페이지에 올렸습니다. 사이트 배포가 끝나면 보입니다.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

export async function unfeatureEvent(eventId: string): Promise<ActionResult> {
  await requireAdmin()

  try {
    const { removed } = await collector.unfeatureEvent(eventId)
    revalidatePath('/events')
    return { ok: true, message: removed ? '이벤트 페이지에서 내렸습니다.' : '이미 내려가 있는 행사입니다.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}
