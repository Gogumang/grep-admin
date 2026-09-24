import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { collector, CollectorRequestError } from '@/lib/collector'
import { saveDeviceSession } from '@/lib/deviceSession'
import { requireAdminAccount } from '@/lib/session'

/**
 * go-runner 의 "어드민 열기"가 브라우저를 보내는 자리.
 *
 * go-runner 가 등록된 Mac 의 Secure Enclave 키로 collector 에 증명하고 받은 code 를 들고 온다.
 * 세션 id 가 아니라 code 를 주소에 싣는 이유 — 주소는 방문 기록에 남는다. code 는 60초 안에 한 번만 쓸 수 있다.
 */
export async function GET(request: NextRequest) {
  await requireAdminAccount()

  const code = request.nextUrl.searchParams.get('code')
  if (!code) redirect('/device?error=missing_code')

  let session: { deviceSessionId: string; expiresAt: string }
  try {
    session = await collector.redeemDeviceHandoff(code)
  } catch (error) {
    const reason = error instanceof CollectorRequestError ? error.code : 'unknown'
    redirect(`/device?error=${encodeURIComponent(reason)}`)
  }

  await saveDeviceSession(session.deviceSessionId, session.expiresAt)
  redirect('/')
}
