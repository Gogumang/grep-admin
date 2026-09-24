import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config'

/** 로그인 없이 열려야 하는 경로. 로그인 화면과 OAuth 콜백뿐이다. */
const PUBLIC_PATH_PREFIXES = ['/login', '/auth']

/**
 * 매 요청마다 세션 쿠키를 갱신하고, 로그인하지 않은 사람을 로그인 화면으로 보낸다.
 *
 * 여기까지가 낙관적 확인이다 — "누구인가"만 보고 "무엇을 할 수 있는가"는 보지 않는다.
 * 허용된 계정인지는 데이터에 가까운 requireAdmin()에서 판단한다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)

        supabaseResponse = NextResponse.next({ request })

        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
        for (const [key, value] of Object.entries(headers ?? {})) {
          supabaseResponse.headers.set(key, value)
        }
      },
    },
  })

  // createServerClient와 getClaims 사이에 코드를 넣지 않는다.
  // 순서가 어긋나면 사용자가 무작위로 로그아웃되고, 원인을 찾기가 아주 어렵다.
  //
  // getUser가 아니라 getClaims다 — 이 프로젝트는 비대칭 서명 키(ES256)를 써서 getClaims가 JWT 서명을
  // 공개 키로 직접 검증하고 Supabase에 묻지 않는다. proxy는 모든 요청에서 돌기 때문에 getUser를 쓰면
  // 누를 때마다 Supabase 왕복이 하나씩 붙는다. 세션이 서버에서 끊겼는지까지 보는 확인은
  // requireAdmin(getUser)이 한 번 더 한다 — 여기는 비로그인 차단만 맡는다.
  const { data } = await supabase.auth.getClaims()
  const isSignedIn = Boolean(data?.claims)

  const isPublicPath = PUBLIC_PATH_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix))

  if (!isSignedIn && !isPublicPath) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  // supabaseResponse를 그대로 돌려준다 — 새 응답 객체를 만들면 갱신된 쿠키가 빠지고
  // 브라우저와 서버의 세션이 어긋나 로그인이 조용히 풀린다.
  return supabaseResponse
}
