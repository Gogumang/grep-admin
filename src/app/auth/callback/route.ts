import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GitHub가 사용자를 돌려보내는 자리. 받은 code를 세션으로 바꾼다.
 *
 * next 파라미터는 우리 사이트 안의 상대 경로만 받는다 — 받은 값을 그대로 믿으면
 * 로그인 링크가 남의 사이트로 보내는 발판이 된다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const requested = searchParams.get('next') ?? '/'
  const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'

  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`)

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(`${origin}/login?error=exchange_failed`)

  // 로드밸런서 뒤에서는 origin이 내부 주소라 그대로 쓰면 사용자가 닿지 못한다.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocal = process.env.NODE_ENV === 'development'
  if (!isLocal && forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`)

  return NextResponse.redirect(`${origin}${next}`)
}
