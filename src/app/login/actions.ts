'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * GitHub 로그인을 시작한다.
 *
 * signInWithOAuth는 이동할 주소를 돌려줄 뿐 스스로 이동하지 않는다 —
 * 서버에서는 브라우저를 그 주소로 보내야 한다.
 */
export async function signInWithGitHub() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? 'http://localhost:3001'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error) throw new Error(`GitHub 로그인을 시작하지 못했습니다: ${error.message}`)

  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
