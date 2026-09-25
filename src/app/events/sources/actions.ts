'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

/** 판매처 하나의 매일 수집을 켜거나 끈다. 다음 수집(매일 08:30·지금 갱신)부터 반영된다. */
export async function setEventSourceEnabled(key: string, enabled: boolean): Promise<{ ok: boolean; message: string }> {
  await requireAdmin()
  try {
    const source = await collector.setEventSourceEnabled(key, enabled)
    revalidatePath('/events/sources')
    return { ok: true, message: `${source.label} 수집 ${source.enabled ? '켬' : '끔'}` }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : `알 수 없는 오류: ${(error as Error).message}`
    return { ok: false, message }
  }
}
