'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { clearDeviceSession } from '@/lib/deviceSession'

/**
 * GitHub 로그인을 시작한다.
 *
 * signInWithOAuth는 이동할 주소를 돌려줄 뿐 스스로 이동하지 않는다 —
 * 서버에서는 브라우저를 그 주소로 보내야 한다.
 */
export async function signInWithGitHub() {
  const supabase = await createClient()
  const origin = await requestOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error) throw new Error(`GitHub 로그인을 시작하지 못했습니다: ${error.message}`)

  redirect(data.url)
}

/**
 * 사용자가 접속한 주소. origin 헤더가 빠지면 프록시가 넘긴 호스트로 조립한다 —
 * localhost 같은 고정값으로 떨어지면 배포본에서 로그인 후 로컬 주소로 튕긴다.
 */
async function requestOrigin(): Promise<string> {
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  if (origin) return origin

  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  if (!host) throw new Error('접속 주소를 알 수 없어 GitHub 로그인을 시작하지 못했습니다')

  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http'
  return `${protocol}://${host}`
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // 다른 계정으로 들어올 때 앞 사람의 기기 세션이 따라가지 않게 한다.
  await clearDeviceSession()
  redirect('/login')
}
