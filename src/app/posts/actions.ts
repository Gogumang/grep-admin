'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

/**
 * 글을 목록에서 숨기거나 다시 드러낸다.
 *
 * 파일을 지우지 않는다 — 지우면 다음 수집 때 "없는 글"로 판단해 그대로 다시 들어온다.
 * 원저작자가 내려달라고 했을 때 필요한 것도 이 통로다.
 */
export async function togglePostHidden(postId: string, hidden: boolean): Promise<ActionResult> {
  await requireAdmin()

  try {
    await collector.setPostHidden(postId, hidden)
    revalidatePath('/posts')
    return { ok: true, message: hidden ? '숨겼습니다.' : '다시 보이게 했습니다.' }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : (error as Error).message
    return { ok: false, message }
  }
}
