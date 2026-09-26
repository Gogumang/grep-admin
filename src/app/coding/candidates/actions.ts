'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError, type CodingSourceKey } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ImportActionResult {
  ok: boolean
  message: string
  /** 가져온(또는 이미 있던) 초안의 id. 화면이 그 편집 화면으로 간다. */
  problemId?: string
}

/**
 * 후보 하나를 문제 초안으로 가져온다. 지문을 받을 수 있는 곳이면 이때 받는다(몇 초).
 * 초안은 공개되지 않는다 — 편집 화면에서 지문을 우리 말로 다시 쓰고 케이스를 채운 뒤 공개한다.
 */
export async function importCodingCandidate(source: CodingSourceKey, externalId: string): Promise<ImportActionResult> {
  await requireAdmin()
  try {
    const { problemId, isNew } = await collector.importCodingCandidate(source, externalId)
    revalidatePath('/coding')
    revalidatePath('/coding/candidates')
    const message = isNew ? '초안으로 가져왔습니다. 지문을 고쳐 쓰고 케이스를 채워 주세요.' : '이미 가져온 문제라 그 초안을 엽니다.'
    return { ok: true, message, problemId }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : `알 수 없는 오류: ${(error as Error).message}`
    return { ok: false, message }
  }
}
