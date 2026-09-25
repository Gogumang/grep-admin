import 'server-only'

import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from './supabase/server'
import { readDeviceSession } from './deviceSession'

/**
 * 어드민에 들어올 수 있는 GitHub 계정.
 *
 * 숫자 id로 둔다 — 사용자 이름은 바뀔 수 있고, 비운 이름을 남이 다시 가져갈 수 있다.
 * 확인 방법: https://api.github.com/users/<사용자이름> 의 id 값.
 *
 * 비어 있으면 아무도 통과하지 못한다. GitHub 계정만 있으면 누구나 들어오는 관리 화면이
 * 공개 주소에 떠 있는 것보다, 기동 자체가 실패하는 편이 낫다.
 */
const allowedGithubIds = (process.env.ADMIN_ALLOWED_GITHUB_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => id.length > 0)

if (allowedGithubIds.length === 0) {
  throw new Error(
    'ADMIN_ALLOWED_GITHUB_IDS 가 비어 있습니다. 어드민에 들어올 GitHub 숫자 id를 쉼표로 나열하세요 ' +
      '(https://api.github.com/users/<사용자이름> 의 id).',
  )
}

/** 허용 목록 그대로. 관리 → 허용 계정 화면이 보여준다 — 값은 환경변수라 화면에서 바꿀 수 없다. */
export function listAllowedGithubIds(): readonly string[] {
  return allowedGithubIds
}

/** 로그인한 사용자. 없으면 null. 한 렌더 안에서는 한 번만 확인한다. */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()

  // getSession이 아니라 getUser다 — getSession은 쿠키에 담긴 내용을 검증 없이 믿는다.
  const { data } = await supabase.auth.getUser()
  return data.user
})

/** GitHub 제공자가 준 숫자 id가 허용 목록에 있는가. */
export function isAllowedAdmin(user: User): boolean {
  return allowedGithubIds.includes(String(user.user_metadata?.provider_id ?? ''))
}

/**
 * 페이지와 Server Action이 맨 앞에서 부른다.
 *
 * proxy에서 이미 걸렀는데 또 확인하는 이유 — proxy는 경로를 보고 판단하는데
 * Server Action은 경로 없이 불릴 수 있다. 데이터를 만지기 직전에 확인해야 한다.
 */
export const requireAdmin = cache(async (): Promise<User> => {
  const user = await requireAdminAccount()
  // 쿠키가 있는지만 본다. 세션이 살아 있는지는 collector 가 매 요청에서 판단한다 —
  // 여기서 막는 것은 go-runner 로 열지 않은 브라우저에 빈 화면 대신 안내를 보여주기 위해서다.
  if (!(await readDeviceSession())) redirect('/device')
  return user
})

/**
 * 계정만 확인한다. 기기 세션을 여는 자리(/device, /device/connect)가 쓴다 —
 * 거기서 기기 세션까지 요구하면 세션을 처음 여는 길이 막힌다.
 */
export const requireAdminAccount = cache(async (): Promise<User> => {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  if (!isAllowedAdmin(user)) redirect('/login?error=not_allowed')
  return user
})
