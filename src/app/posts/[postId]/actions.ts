'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError, type PendingPostEdit } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

/**
 * 이미 나간 글을 고친다.
 *
 * 검토 글(savePending)과 나눈 이유는 무게다 — 저쪽은 아직 아무도 안 본 글이고, 이쪽은
 * 사람이 읽고 있는 글이다. collector가 커밋 메시지에 무엇을 고쳤는지 남기므로,
 * 되돌려야 할 때 저장소 이력에서 찾을 수 있다.
 *
 * 사이트에 반영되려면 재배포가 필요하다 — 정본이 저장소 파일이고 사이트는 정적 빌드다.
 * 저장했다는 말에 그 사실을 함께 담는다. 그러지 않으면 사이트를 열어 보고 안 바뀌었다고 여긴다.
 */
export async function savePost(postId: string, edit: PendingPostEdit): Promise<ActionResult> {
  await requireAdmin()

  try {
    await collector.editPost(postId, edit)
    revalidatePath(`/posts/${postId}`)
    revalidatePath('/posts')

    return { ok: true, message: '저장했습니다. 사이트에는 다음 배포부터 반영됩니다.' }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : (error as Error).message
    return { ok: false, message }
  }
}
