'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError, type EventImageSuggestion } from '@/lib/collector'
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
    revalidatePath('/events/published')
    return { ok: true, message: '이벤트 페이지에 올렸습니다. 사이트 배포가 끝나면 보입니다.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/** 새로 모은 행사를 한 번에 올린다. 후보 등록과 이벤트 페이지 반영을 collector 가 함께 한다(커밋 두 번). */
export async function publishEvent(eventId: string, imageUrl: string): Promise<ActionResult> {
  await requireAdmin()

  try {
    await collector.publishEvent(eventId, imageUrl.trim())
    revalidatePath('/events')
    revalidatePath('/events/published')
    return { ok: true, message: '이벤트 페이지에 올렸습니다. 사이트 배포가 끝나면 보입니다.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/** 올리기 창에 미리 채울 공식 사이트 이미지. 보조다 — 못 찾거나 실패하면 null 이고 사람이 직접 넣는다. */
export async function suggestEventImage(eventId: string): Promise<EventImageSuggestion | null> {
  await requireAdmin()

  try {
    return (await collector.suggestEventImage(eventId)) ?? null
  } catch {
    return null
  }
}

export async function unfeatureEvent(eventId: string): Promise<ActionResult> {
  await requireAdmin()

  try {
    const { removed } = await collector.unfeatureEvent(eventId)
    revalidatePath('/events')
    revalidatePath('/events/published')
    return { ok: true, message: removed ? '이벤트 페이지에서 내렸습니다.' : '이미 내려가 있는 행사입니다.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/**
 * 판매처(티켓타코·이벤터스)와 Dev-Event 를 지금 다시 읽는다. 매일 08:30 에 DAG 가 하는 일을 기다리지 않고 한 번 돌린다.
 *
 * 모은 목록은 사이트 저장소 파일이라 화면은 GitHub 캐시(최대 5분)가 풀린 뒤 바뀐다 — 그래서 결과를 숫자로 알린다.
 */
export async function refreshEvents(): Promise<ActionResult> {
  await requireAdmin()

  try {
    const result = await collector.collectEvents()
    // 못 읽은 날에도 판매처별 기록은 남으므로 수집처 화면은 늘 새로 그린다.
    revalidatePath('/events/sources')
    if (result.skippedReason) return { ok: false, message: result.skippedReason }
    revalidatePath('/events')
    revalidatePath('/events/published')
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

/** 올리지 않을 행사를 치운다. 다시 모여도 대기로 돌아오지 않는다. */
export async function rejectEvents(eventIds: string[]): Promise<ActionResult> {
  await requireAdmin()
  try {
    const result = await collector.rejectEvents(eventIds)
    revalidatePath('/events')
    revalidatePath('/events/published')
    return { ok: true, message: `행사 ${result.affectedEventCount}건을 치웠습니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
