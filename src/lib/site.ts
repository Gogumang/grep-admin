/**
 * 공개 사이트에서 글 목록을 읽는다.
 *
 * collector가 아니라 이쪽에 묻는 이유 — collector는 GitHub API로 파일을 읽어서
 * 글이 667개면 호출도 667번이다. 공개 사이트는 이미 파싱해서 들고 있다.
 */
const baseUrl = process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000'
const adminToken = process.env.ADMIN_API_TOKEN ?? ''

const REQUEST_TIMEOUT_MILLISECONDS = 15_000

export interface Post {
  id: string
  title: string
  url: string
  blogName: string
  blogKey: string
  publishedAt: string
  summary: string
  tags: string[]
  hidden: boolean
}

export async function loadPostsForAdmin(): Promise<Post[]> {
  const response = await fetch(`${baseUrl}/api/posts?includeHidden=1`, {
    headers: { 'x-admin-token': adminToken },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? `글 목록을 읽지 못했습니다 (HTTP ${response.status})`)
  }

  return ((await response.json()) as { posts: Post[] }).posts
}
