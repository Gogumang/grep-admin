'use server'

import { revalidatePath } from 'next/cache'
import { CollectorRequestError } from '@/lib/collector'
import { books, type BookSourceKey } from '@/lib/books'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}

/** 수집처 하나를 켜거나 끈다. 다음 수집부터 반영된다. */
export async function setBookSourceEnabled(key: BookSourceKey, enabled: boolean): Promise<ActionResult> {
  await requireAdmin()
  try {
    const source = await books.setSourceEnabled(key, enabled)
    revalidatePath('/books/sources')
    return { ok: true, message: `${source.label} 수집 ${source.enabled ? '켬' : '끔'}` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/**
 * 켜 둔 수집처를 지금 읽는다. 다 읽을 때까지 기다렸다가 결과를 숫자로 알린다.
 * 한 곳을 못 읽어도 나머지는 쌓인다 — 못 읽은 곳은 이름을 붙여 알린다.
 */
export async function collectBooks(): Promise<ActionResult> {
  await requireAdmin()
  try {
    const runs = await books.collect()
    revalidatePath('/books/sources')
    revalidatePath('/books')
    if (runs.length === 0) return { ok: false, message: '켜 둔 수집처가 없어 읽지 않았습니다.' }
    const collected = runs.filter((run) => run.isCollected)
    const failedCount = runs.length - collected.length
    const newCount = collected.reduce((sum, run) => sum + run.newCount, 0)
    const failed = failedCount > 0 ? ` · ${failedCount}곳은 못 읽음` : ''
    return { ok: collected.length > 0, message: `${collected.length}곳을 읽어 새 책 ${newCount}권을 쌓았습니다${failed}.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
