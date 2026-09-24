'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

export async function approveDevice(thumbprint: string, name: string): Promise<ActionResult> {
  return run(() => collector.approveDevice(thumbprint), `${name} 등록함`)
}

export async function rejectDeviceEnrollment(thumbprint: string, name: string): Promise<ActionResult> {
  return run(() => collector.rejectDeviceEnrollment(thumbprint), `${name} 요청 거절함`)
}

/** 지우면 그 Mac 에서 열려 있던 어드민도 바로 잠긴다 (collector 가 세션을 닫는다). */
export async function removeDevice(thumbprint: string, name: string): Promise<ActionResult> {
  return run(() => collector.removeDevice(thumbprint), `${name} 삭제함`)
}

async function run(call: () => Promise<void>, successMessage: string): Promise<ActionResult> {
  await requireAdmin()
  try {
    await call()
    revalidatePath('/devices')
    return { ok: true, message: successMessage }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : `알 수 없는 오류: ${(error as Error).message}`
    return { ok: false, message }
  }
}
