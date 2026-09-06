/**
 * collector 서버를 부르는 얇은 층.
 *
 * 어드민은 저장소 파일을 직접 만지지 않는다 — 커밋 로직이 collector에만 있으면
 * 같은 일을 두 언어로 만들지 않아도 되고, GitHub 토큰도 한 곳에만 두면 된다.
 */
const baseUrl = process.env.COLLECTOR_BASE_URL ?? 'http://localhost:8081'

/**
 * collector가 모든 요청에 요구하는 접근 토큰. 기본값을 두지 않는다 —
 * 빠뜨리면 화면의 모든 동작이 401로 실패하는데, 버튼을 하나씩 눌러보고서야
 * 그 사실을 알게 된다. 모듈을 읽는 순간 실패하는 편이 낫다.
 *
 * collector의 collector.access.token 과 같은 값이어야 한다.
 */
const configuredToken = process.env.COLLECTOR_TOKEN
if (!configuredToken) {
  throw new Error(
    'COLLECTOR_TOKEN 이 설정되지 않았습니다. collector의 collector.access.token 과 같은 값을 .env.local 에 넣으세요.',
  )
}
const accessToken = configuredToken

/** collector가 응답하지 않으면 화면 전체가 멈춘다 — 기다려주는 한계를 둔다. */
const REQUEST_TIMEOUT_MILLISECONDS = 15_000

export interface BlogFeed {
  blogName: string
  blogKey: string
  feedUrl: string
  homepageUrl: string
}

/**
 * 이미 공개된 글. 어드민 화면이 "무엇이 나가 있는가"를 보여줄 때 쓴다.
 *
 * 예전에는 공개 사이트의 /api/posts 를 불렀는데, 사이트가 정적이라 그런 라우트가 없었다.
 * 저장소를 아는 곳은 collector 하나로 모은다.
 */
export interface Post {
  id: string
  title: string
  url: string
  blogName: string
  blogKey: string
  publishedAt: string
  summary: string
  sourceThumbnail: string | null
  tags: string[]
  hidden: boolean
}

/** 검토를 기다리는 글. collector의 /api/admin/pending 응답 모양이다. */
export interface PendingPost {
  id: string
  title: string
  url: string
  blogName: string
  blogKey: string
  publishedAt: string
  summary: string
  sourceThumbnail: string | null
  tags: string[]
  hasBody: boolean
  hasGeneratedThumbnail: boolean
}

export interface PendingPostDetail {
  post: PendingPost
  body: string | null
}

/** 고치지 않은 항목은 보내지 않는다 — 서버에서 null은 "그대로 둔다"는 뜻이다. */
export interface PendingPostEdit {
  title?: string
  summary?: string
  tags?: string[]
  sourceThumbnail?: string
  body?: string
}

/** collector가 실패를 알려주는 모양. 그대로 화면에 옮긴다. */
export interface CollectorError {
  error: string
  message: string
}

export class CollectorRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      // 토큰은 서버에서만 실린다 — Server Actions로만 이 층을 부르므로 브라우저에 나가지 않는다.
      headers: { 'content-type': 'application/json', 'X-Collector-Token': accessToken, ...init?.headers },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
      cache: 'no-store',
    })
  } catch (error) {
    // 서버가 아예 안 떠 있는 경우다. 원인을 그대로 보여줘야 사용자가 조치할 수 있다.
    throw new CollectorRequestError(
      `collector에 연결하지 못했습니다 (${baseUrl}). 서버가 떠 있는지 확인하세요.`,
      'collector_unreachable',
    )
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as CollectorError | null
    throw new CollectorRequestError(body?.message ?? `요청이 실패했습니다 (HTTP ${response.status})`, body?.error ?? 'unknown')
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const collector = {
  listFeeds: () => request<BlogFeed[]>('/api/feeds'),

  addBlog: (blogName: string, feedUrl: string) =>
    request<BlogFeed>('/api/admin/feeds', { method: 'POST', body: JSON.stringify({ blogName, feedUrl }) }),

  removeBlog: (blogKey: string) =>
    request<BlogFeed>(`/api/admin/feeds/${encodeURIComponent(blogKey)}`, { method: 'DELETE' }),

  setPostHidden: (postId: string, hidden: boolean) =>
    request<void>(`/api/admin/posts/${postId}/hidden`, { method: 'PUT', body: JSON.stringify({ hidden }) }),

  listPicks: () => request<{ pickUrls: string[] }>('/api/admin/picks'),

  savePicks: (pickUrls: string[]) =>
    request<void>('/api/admin/picks', { method: 'PUT', body: JSON.stringify({ pickUrls }) }),

  openCollectionRun: () =>
    request<{ runId: string; existingPostCount: number; feeds: BlogFeed[] }>('/api/collections', { method: 'POST' }),

  collectFeed: (runId: string, blogKey: string) =>
    request<{ blogName: string; newPostCount: number; skippedWithoutDate: number; skippedDuplicate: number }>(
      `/api/collections/${runId}/feeds/${encodeURIComponent(blogKey)}`,
      { method: 'POST' },
    ),

  listPosts: () => request<Post[]>('/api/admin/posts'),

  listPending: () => request<PendingPost[]>('/api/admin/pending'),

  findPending: (postId: string) => request<PendingPostDetail>(`/api/admin/pending/${postId}`),

  savePending: (postId: string, edit: PendingPostEdit) =>
    request<void>(`/api/admin/pending/${postId}`, { method: 'PUT', body: JSON.stringify(edit) }),

  publishPending: (postIds: string[]) =>
    request<{ affectedPostCount: number }>('/api/admin/pending/publish', {
      method: 'POST',
      body: JSON.stringify({ postIds }),
    }),

  rejectPending: (postIds: string[]) =>
    request<{ affectedPostCount: number }>('/api/admin/pending/reject', {
      method: 'POST',
      body: JSON.stringify({ postIds }),
    }),

  commitCollectionRun: (runId: string) =>
    request<{ committedPostCount: number; blogNames: string[] }>(`/api/collections/${runId}/commit`, { method: 'POST' }),
}
