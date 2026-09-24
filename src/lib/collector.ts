/**
 * collector 서버를 부르는 얇은 층.
 *
 * 어드민은 저장소 파일을 직접 만지지 않는다 — 커밋 로직이 collector에만 있으면
 * 같은 일을 두 언어로 만들지 않아도 되고, GitHub 토큰도 한 곳에만 두면 된다.
 */
import { readDeviceSession } from './deviceSession'

const baseUrl = process.env.COLLECTOR_BASE_URL ?? 'http://localhost:8081'

/**
 * collector가 어드민에게 요구하는 접근 토큰. 기본값을 두지 않는다 —
 * 빠뜨리면 화면의 모든 동작이 401로 실패하는데, 버튼을 하나씩 눌러보고서야
 * 그 사실을 알게 된다. 모듈을 읽는 순간 실패하는 편이 낫다.
 *
 * collector의 collector.access.admin-token(COLLECTOR_ADMIN_TOKEN) 과 같은 값이어야 한다.
 * 이 토큰만으로는 부족하다 — 등록된 Mac 의 go-runner 가 연 기기 세션이 함께 실려야 collector 가 받는다.
 */
const configuredToken = process.env.COLLECTOR_ADMIN_TOKEN
if (!configuredToken) {
  throw new Error(
    'COLLECTOR_ADMIN_TOKEN 이 설정되지 않았습니다. collector의 collector.access.admin-token 과 같은 값을 .env.local 에 넣으세요.',
  )
}
const accessToken = configuredToken

/** collector가 응답하지 않으면 화면 전체가 멈춘다 — 기다려주는 한계를 둔다. */
const REQUEST_TIMEOUT_MILLISECONDS = 15_000
/** 행사 올리기는 남의 서버에서 이미지를 받아(최대 30초) 굽고 커밋까지 한다 — 보통 요청보다 넉넉히 기다린다. */
const FEATURE_EVENT_TIMEOUT_MILLISECONDS = 60_000

export interface BlogFeed {
  blogName: string
  blogKey: string
  feedUrl: string
  homepageUrl: string
  /**
   * 수집 대상인지. 끄면 다음 수집부터 빠지고, 이미 모은 글은 그대로 남는다.
   *
   * 목록에서 빼는 것과 다른 일이다 — 빼면 되돌릴 때 blogKey가 새로 만들어져
   * 그 블로그로 모아둔 지난 글들이 주인을 잃는다.
   */
  active: boolean
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
  /** 최근 7일 조회수. GA4를 아직 붙이지 않았으면 0이다. */
  recentViews: number
  totalViews: number
}

/**
 * 공개된 글 한 건과 본문. collector의 /api/admin/posts/{id} 응답 모양이다.
 *
 * 목록(Post)과 달리 조회수가 없다 — 미리보기는 "이 글이 어떻게 보이는가"만 묻는 화면이고,
 * 조회수는 목록에 이미 나와 있다.
 */
export interface PostDetail {
  post: {
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
  /** 본문 파일이 없는 글이 있다 — 그때는 null이고, 화면이 "본문 없음"으로 알린다. */
  body: string | null
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
}

/**
 * 오늘 하루 조회수 요약. collector의 /api/analytics/views/summary 응답 모양이다.
 *
 * 하루가 끝나지 않았으므로 잠정값이다 — Airflow가 00·09·12·18시에 GA4에서 받아 쌓고,
 * 화면은 그 DB만 읽는다. 실시간이 아니라 최대 몇 시간 뒤처진다.
 *
 * postCount가 0이면 아직 한 번도 받지 않았다는 뜻이다 — 애널리틱스는 조회가 0인 글을
 * 아예 돌려주지 않는다. "아무도 안 봤다"와 구분해야 해서 함께 받는다.
 */
export interface DailyViewSummary {
  date: string
  postCount: number
  totalViews: number
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

/**
 * 검토 화면이 보는 채용공고 하나. collector의 /api/admin/jobs 응답 모양이다.
 *
 * 글(PendingPost)과 달리 상태를 들고 온다 — 공고는 대기·공개·치움 사이를 오가고,
 * 원문에서 닫혔다가 다시 열리기도 해서 "어느 목록에 있나"만으로 상태를 알 수 없다.
 */
export interface ReviewedJob {
  id: string
  companyKey: string
  /** 공고를 낸 회사. 계열사 공고면 계열사 이름이다(예: 카카오페이). */
  companyName: string
  title: string
  /** 원문 채용 페이지. 지원은 여기서 한다. */
  url: string
  jobCategory: string | null
  employmentType: string | null
  location: string | null
  careerLevel: string | null
  /** ISO-8601. 원문이 주지 않으면 null. */
  openedAt: string | null
  /** ISO-8601. 상시채용이 대부분이라 null 이 정상이다. */
  closesAt: string | null
  reviewStatus: 'pending' | 'published' | 'rejected'
  /** 원문 목록에서 사라진 공고. 새로 공개할 수 없다. */
  closed: boolean
  hasBody: boolean
}

export interface ReviewedJobDetail {
  job: ReviewedJob
  /** 마크다운. 본문을 읽지 못한 공고(라인 등)는 null 이다. */
  body: string | null
}

/** 이벤트 페이지에 올린 행사. collector의 /api/admin/events/featured 응답 모양이다. */
export interface FeaturedEvent {
  id: string
  /** 사이트 기준 경로(/events/x.avif)나 R2 전체 주소. */
  image: string
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

async function request<T>(path: string, init?: RequestInit, timeoutMilliseconds = REQUEST_TIMEOUT_MILLISECONDS): Promise<T> {
  const deviceSession = await readDeviceSession()
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      // 토큰은 서버에서만 실린다 — Server Actions로만 이 층을 부르므로 브라우저에 나가지 않는다.
      headers: {
        'content-type': 'application/json',
        'X-Collector-Token': accessToken,
        ...(deviceSession ? { 'X-Device-Session': deviceSession } : {}),
        ...init?.headers,
      },
      signal: AbortSignal.timeout(timeoutMilliseconds),
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

/** 어드민을 열 수 있는 Mac. configuration 은 collector 설정(COLLECTOR_DEVICE_KEYS)으로 등록돼 화면에서 지울 수 없다. */
export interface ManagedDevice {
  thumbprint: string
  name: string
  source: 'configuration' | 'approved'
  registeredAt: string | null
  /** go-runner 가 마지막으로 신호를 보낸 시각. collector 가 다시 뜬 뒤로는 비어 있을 수 있다. */
  lastSeenAt: string | null
  /** 지금 이 어드민 세션을 연 기기인가 */
  isCurrent: boolean
}

/** go-runner 가 보낸 등록 요청. 10분 안에 승인하지 않으면 사라진다. */
export interface DeviceEnrollmentRequest {
  thumbprint: string
  name: string
  requestedAt: string
}

export const collector = {
  listDevices: () =>
    request<{ devices: ManagedDevice[]; enrollmentRequests: DeviceEnrollmentRequest[] }>('/api/admin/devices'),

  approveDevice: (thumbprint: string) =>
    request<void>(`/api/admin/devices/${encodeURIComponent(thumbprint)}/approve`, { method: 'POST' }),

  rejectDeviceEnrollment: (thumbprint: string) =>
    request<void>(`/api/admin/devices/${encodeURIComponent(thumbprint)}/enrollment`, { method: 'DELETE' }),

  removeDevice: (thumbprint: string) =>
    request<void>(`/api/admin/devices/${encodeURIComponent(thumbprint)}`, { method: 'DELETE' }),

  /** go-runner 가 브라우저로 넘긴 60초짜리 code 를 기기 세션으로 바꾼다. 한 번만 쓸 수 있다. */
  redeemDeviceHandoff: (handoffCode: string) =>
    request<{ deviceSessionId: string; expiresAt: string }>('/api/device/handoffs/redeem', {
      method: 'POST',
      body: JSON.stringify({ handoffCode }),
    }),

  /**
   * 등록된 블로그 전부. 꺼둔 것도 함께 온다 — 어드민이 다시 켤 수 있어야 한다.
   *
   * active 를 주지 않는 응답은 켜진 것으로 읽는다. 이 값은 collector에 나중에 생겼고,
   * 서버가 아직 그 버전이 아니면 화면이 전부 꺼진 것처럼 보인다 — 실제로는 전부 수집 중인데
   * 그렇게 보이면 고치려고 스위치를 건드리게 된다. DAG(grep_sync_blogs)와 같은 규칙이다.
   */
  listFeeds: async (): Promise<BlogFeed[]> =>
    (await request<BlogFeed[]>('/api/feeds')).map((feed) => ({ ...feed, active: feed.active ?? true })),

  addBlog: (blogName: string, feedUrl: string) =>
    request<BlogFeed>('/api/admin/feeds', { method: 'POST', body: JSON.stringify({ blogName, feedUrl }) }),

  /** 수집을 켜거나 끈다. 바뀐 뒤의 모습을 돌려준다. */
  setBlogActive: (blogKey: string, active: boolean) =>
    request<BlogFeed>(`/api/admin/feeds/${encodeURIComponent(blogKey)}/active`, {
      method: 'PUT',
      body: JSON.stringify({ active }),
    }),

  setPostHidden: (postId: string, hidden: boolean) =>
    request<void>(`/api/admin/posts/${postId}/hidden`, { method: 'PUT', body: JSON.stringify({ hidden }) }),


  openCollectionRun: () =>
    request<{ runId: string; existingPostCount: number; feeds: BlogFeed[] }>('/api/collections', { method: 'POST' }),

  collectFeed: (runId: string, blogKey: string) =>
    request<{ blogName: string; newPostCount: number; skippedWithoutDate: number; skippedDuplicate: number }>(
      `/api/collections/${runId}/feeds/${encodeURIComponent(blogKey)}`,
      { method: 'POST' },
    ),

  listPosts: () => request<Post[]>('/api/admin/posts'),

  /** 미리보기용. 목록에 없는 본문을 함께 준다. */
  findPost: (postId: string) => request<PostDetail>(`/api/admin/posts/${postId}`),

  /** 이미 나간 글을 고친다. 고치지 않은 항목은 보내지 않는다 — 서버에서 null은 "그대로 둔다"다. */
  editPost: (postId: string, edit: PendingPostEdit) =>
    request<PostDetail>(`/api/admin/posts/${postId}`, { method: 'PUT', body: JSON.stringify(edit) }),

  /**
   * 하루 요약. 날짜(YYYYMMDD)를 주지 않으면 collector 기준 오늘이다 —
   * collector JVM 이 Asia/Seoul 로 돌므로 KST 오늘과 같다.
   *
   * 대시보드가 어제치도 부르는 이유 — GA4 당일 집계가 몇 시간 늦어서, 오늘치가 비어 있는
   * 시간대가 하루 중 꽤 길다. 그때는 어제 숫자를 날짜와 함께 보여준다.
   */
  viewSummary: (date?: string) =>
    request<DailyViewSummary>(`/api/analytics/views/summary${date ? `?date=${date}` : ''}`),

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

  /** 검토를 기다리는 열린 공고. 본문은 싣지 않는다. */
  listPendingJobs: () => request<ReviewedJob[]>('/api/admin/jobs/pending'),

  /** 사이트에 올라가 있는 공고. 내릴 공고를 고르는 목록이다. */
  listPublishedJobs: () => request<ReviewedJob[]>('/api/admin/jobs/published'),

  findJob: (jobId: string) => request<ReviewedJobDetail>(`/api/admin/jobs/${encodeURIComponent(jobId)}`),

  /**
   * 고른 공고를 사이트에 올린다. 닫혔거나 이미 올린 공고는 collector가 건너뛰므로,
   * 요청한 수가 아니라 실제로 올린 수(affectedJobCount)를 보여준다.
   */
  publishJobs: (jobIds: string[]) =>
    request<{ affectedJobCount: number }>('/api/admin/jobs/publish', { method: 'POST', body: JSON.stringify({ jobIds }) }),

  rejectJobs: (jobIds: string[]) =>
    request<{ affectedJobCount: number }>('/api/admin/jobs/reject', { method: 'POST', body: JSON.stringify({ jobIds }) }),

  unpublishJobs: (jobIds: string[]) =>
    request<{ affectedJobCount: number }>('/api/admin/jobs/unpublish', { method: 'POST', body: JSON.stringify({ jobIds }) }),

  /** 이벤트 페이지에 올린 행사. 저장소 파일을 바로 읽으면 5분 캐시라, 올리고 내린 직후가 어긋난다. */
  listFeaturedEvents: () => request<FeaturedEvent[]>('/api/admin/events/featured'),

  /** 이미지 주소의 그림을 collector가 받아 R2에 올린 뒤 이벤트 페이지 목록에 넣는다. */
  featureEvent: (eventId: string, imageUrl: string) =>
    request<FeaturedEvent>(
      `/api/admin/events/${encodeURIComponent(eventId)}/feature`,
      { method: 'POST', body: JSON.stringify({ imageUrl }) },
      FEATURE_EVENT_TIMEOUT_MILLISECONDS,
    ),

  unfeatureEvent: (eventId: string) =>
    request<{ removed: boolean }>(`/api/admin/events/${encodeURIComponent(eventId)}/feature`, { method: 'DELETE' }),
}
