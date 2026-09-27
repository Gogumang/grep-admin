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

/**
 * 글 분류 하나만 바꾼다. 글 편집 화면의 저장(savePost)과 같은 collector 통로를 쓰고,
 * 목록에서 칩을 고르는 즉시 부른다 — 분류 하나 바꾸려고 글을 열지 않아도 된다.
 */
export async function changePostCategory(postId: string, category: string): Promise<ActionResult> {
  await requireAdmin()

  try {
    await collector.editPost(postId, { category })
    revalidatePath('/posts')
    revalidatePath(`/posts/${postId}`)
    return { ok: true, message: `분류를 ${category}(으)로 바꿨습니다. 사이트에는 다음 배포부터 반영됩니다.` }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : (error as Error).message
    return { ok: false, message }
  }
}
