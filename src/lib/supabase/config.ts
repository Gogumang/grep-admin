/**
 * Supabase 접속 정보. 기본값을 두지 않는다 — 빠뜨린 채 뜨면 로그인 화면은
 * 멀쩡히 보이는데 눌러도 아무 일이 없다. 기동에서 잡는 편이 낫다.
 *
 * 여기 두는 것은 공개해도 되는 publishable(구 anon) 키다.
 * 이 키만으로는 Supabase의 행 수준 보안을 넘지 못한다 — secret 키는 두지 않는다.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!url) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL 이 설정되지 않았습니다. Supabase 대시보드의 Project URL 입니다.')
}
if (!publishableKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 이 설정되지 않았습니다. ' +
      'Supabase 대시보드의 publishable 키(예전 프로젝트라면 anon 키)입니다.',
  )
}

export const SUPABASE_URL = url
export const SUPABASE_PUBLISHABLE_KEY = publishableKey
