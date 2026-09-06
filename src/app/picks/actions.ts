'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

/**
 * 오늘의 픽 목록을 통째로 저장한다.
 *
 * 항목 하나씩 넣고 빼는 API를 두지 않은 이유 — 픽은 '순서'가 의미를 갖는다.
 * 순서까지 다루려면 결국 목록 전체를 주고받게 되고, 그러면 부분 수정 API는
 * 같은 일을 두 가지 방법으로 하는 셈이 된다.
 */
export async function savePicks(pickUrls: string[]): Promise<ActionResult> {
  await requireAdmin()

  try {
    await collector.savePicks(pickUrls)
    revalidatePath('/picks')

    // 비우면 화면이 자동 선정으로 돌아간다 — 오류가 아니라 정상 동작이다.
    return {
      ok: true,
      message: pickUrls.length === 0 ? '픽을 비웠습니다. 화면은 자동 선정으로 돌아갑니다.' : `${pickUrls.length}개 저장됨`,
    }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : (error as Error).message
    return { ok: false, message }
  }
}
