import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config'

/** 서버 컴포넌트·Server Action·Route Handler에서 쓰는 Supabase 클라이언트. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다.
          // proxy가 매 요청 세션을 갱신하므로 여기서는 무시해도 된다.
        }
      },
    },
  })
}
