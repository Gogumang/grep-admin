'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

/**
 * 매일 08:45 DAG 가 하는 일을 지금 한다 — 자동으로 읽는 곳(동아리 여섯·부트캠프 둘)의 모집 일정을 읽고,
 * 사람이 적는 곳의 모집 페이지가 바뀌었는지 본다. 페이지 확인이 실패해도 모집 일정 결과는 알린다(보조).
 */
export async function collectClubRecruitments(): Promise<ActionResult> {
  await requireAdmin()
  try {
    const checks = await collector.collectClubRecruitments()
    const pages = await collector.checkClubPages().catch(() => null)
    revalidatePath('/clubs')
    const failed = checks.filter((check) => !check.isOk).map((check) => check.clubKey)
    const found = checks.reduce((sum, check) => sum + check.foundCount, 0)
    const changed = (pages ?? []).filter((page) => page.isChanged).length
    const pageSummary = pages === null ? ' 모집 페이지 변화는 보지 못했습니다.' : changed > 0 ? ` 모집 페이지 ${changed}곳이 바뀌었습니다.` : ''
    return {
      ok: failed.length === 0 && pages !== null,
      message: `${checks.length}곳에서 모집 일정 ${found}건을 읽었습니다${failed.length > 0 ? ` — 실패 ${failed.join('·')}` : ''}.${pageSummary}`,
    }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : `알 수 없는 오류: ${(error as Error).message}`
    return { ok: false, message }
  }
}

/** 동아리 하나의 자동 수집을 켜거나 끈다. 다음 수집(매일 08:45·지금 가져오기)부터 반영된다. */
export async function setClubEnabled(clubKey: string, enabled: boolean): Promise<ActionResult> {
  await requireAdmin()
  try {
    await collector.setClubEnabled(clubKey, enabled)
    revalidatePath('/clubs')
    return { ok: true, message: enabled ? '자동 수집을 켰습니다' : '자동 수집을 껐습니다' }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : `알 수 없는 오류: ${(error as Error).message}`
    return { ok: false, message }
  }
}
