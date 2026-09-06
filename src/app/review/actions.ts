'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError, type PendingPostDetail, type PendingPostEdit } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}

/** 글 하나를 펼친다. 목록에는 본문이 없어서 열 때 따로 받아온다 — 본문이 수 KB라 목록에 싣지 않는다. */
export async function loadPending(postId: string): Promise<PendingPostDetail | { error: string }> {
  await requireAdmin()

  try {
    return await collector.findPending(postId)
  } catch (error) {
    return { error: describe(error) }
  }
}

export async function savePending(postId: string, edit: PendingPostEdit): Promise<ActionResult> {
  await requireAdmin()

  try {
    await collector.savePending(postId, edit)
    revalidatePath('/review')
    return { ok: true, message: '저장했습니다.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/**
 * 고른 글을 공개한다.
 *
 * 한 건씩이 아니라 묶어서 보내는 이유 — 공개 커밋 하나가 사이트 배포 한 번이다.
 */
export async function publishPending(postIds: string[]): Promise<ActionResult> {
  await requireAdmin()

  try {
    const result = await collector.publishPending(postIds)
    revalidatePath('/review')
    revalidatePath('/posts')
    return { ok: true, message: `${result.affectedPostCount}개를 공개했습니다. 곧 사이트에 반영됩니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

export async function rejectPending(postIds: string[]): Promise<ActionResult> {
  await requireAdmin()

  try {
    const result = await collector.rejectPending(postIds)
    revalidatePath('/review')
    return { ok: true, message: `${result.affectedPostCount}개를 대기 목록에서 치웠습니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
