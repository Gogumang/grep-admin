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

/**
 * 판매처(지금은 티켓타코)를 지금 다시 읽는다. 매일 08:30 에 DAG 가 하는 일을 기다리지 않고 한 번 돌린다.
 *
 * 모은 목록은 사이트 저장소 파일이라 화면은 GitHub 캐시(최대 5분)가 풀린 뒤 바뀐다 — 그래서 결과를 숫자로 알린다.
 */
export async function refreshEvents(): Promise<ActionResult> {
  await requireAdmin()

  try {
    const result = await collector.collectEvents()
    if (result.skippedReason) return { ok: false, message: result.skippedReason }
    revalidatePath('/events')
    const unread = result.unreadPageCount > 0 ? `, 못 읽은 행사 ${result.unreadPageCount}건` : ''
    return {
      ok: true,
      message: result.hasSiteChanged
        ? `행사 ${result.readCount}건을 읽어 ${result.listedCount}건으로 갱신했습니다${unread}. 목록은 몇 분 안에 바뀝니다.`
        : `행사 ${result.readCount}건을 읽었고 목록은 그대로입니다${unread}.`,
    }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}
