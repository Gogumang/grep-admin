import 'server-only'

const REQUEST_TIMEOUT_MS = 5_000
/**
 * 토큰 없이 부르는 GitHub API 는 시간당 60번이 한도다. 이름·아바타는 거의 바뀌지 않으니
 * 하루 묵혀 화면을 열 때마다 한도를 쓰지 않게 한다.
 */
const REVALIDATE_SECONDS = 86_400

export interface GithubAccount {
  /** GitHub 숫자 id. 허용 목록에 적힌 값 그대로다. */
  id: string
  /** 조회에 실패하면 null — 계정 정보는 보조 데이터라 id 만으로도 목록은 성립한다. */
  login: string | null
  name: string | null
  avatarUrl: string | null
  profileUrl: string | null
}

/** 숫자 id 로 계정을 찾는다. /users/<이름> 이 아니라 /user/<id> 여야 이름이 바뀌어도 찾아진다. */
async function findGithubAccount(id: string): Promise<GithubAccount> {
  const unknown = { id, login: null, name: null, avatarUrl: null, profileUrl: null }
  try {
    const response = await fetch(`https://api.github.com/user/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return unknown
    const account = (await response.json()) as { login?: string; name?: string | null; avatar_url?: string; html_url?: string }
    return {
      id,
      login: account.login ?? null,
      name: account.name ?? null,
      avatarUrl: account.avatar_url ?? null,
      profileUrl: account.html_url ?? null,
    }
  } catch {
    return unknown
  }
}

export function findGithubAccounts(ids: readonly string[]): Promise<GithubAccount[]> {
  return Promise.all(ids.map(findGithubAccount))
}
