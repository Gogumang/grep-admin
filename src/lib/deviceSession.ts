import 'server-only'

import { cookies } from 'next/headers'

/**
 * 등록된 Mac 의 go-runner 가 collector 에서 연 기기 세션을 담는 쿠키.
 *
 * 값은 collector 가 발급한 세션 id 다. 어드민은 이 값을 판단하지 않고 collector 호출에 실어 보내기만 한다 —
 * 세션이 살아 있는지(12시간, go-runner heartbeat 3분)는 collector 만 안다.
 */
export const DEVICE_SESSION_COOKIE = 'device_session'

export async function readDeviceSession(): Promise<string | undefined> {
  return (await cookies()).get(DEVICE_SESSION_COOKIE)?.value
}

export async function saveDeviceSession(sessionId: string, expiresAt: string): Promise<void> {
  ;(await cookies()).set(DEVICE_SESSION_COOKIE, sessionId, {
    // 스크립트가 읽을 이유가 없다 — 새면 어드민 토큰 없이도 쓸 수는 없지만, 굳이 열어 둘 필요도 없다.
    httpOnly: true,
    // 로컬(http://localhost:3001)에서도 쿠키가 남아야 한다. 운영은 https 뿐이다.
    secure: process.env.NODE_ENV !== 'development',
    // go-runner 가 브라우저를 여는 것은 다른 앱에서 들어오는 최상위 이동이라 Strict 면 첫 화면에 쿠키가 실리지 않는다.
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  })
}

export async function clearDeviceSession(): Promise<void> {
  ;(await cookies()).delete(DEVICE_SESSION_COOKIE)
}
