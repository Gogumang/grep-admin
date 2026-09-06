import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

/**
 * Next 16에서 middleware 파일 컨벤션이 proxy로 바뀌었다 (middleware는 deprecated).
 * app이 src/app 아래에 있으므로 이 파일도 src 아래에 둔다.
 *
 * 여기서 하는 일은 세션 갱신과 비로그인 차단까지다. proxy는 모든 경로에서 돌기 때문에
 * 유일한 방어선이 되면 안 된다 — 실제 권한 판단은 requireAdmin()에서 한 번 더 한다.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
