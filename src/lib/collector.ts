/**
 * collector 서버를 부르는 얇은 층.
 *
 * 어드민은 저장소 파일을 직접 만지지 않는다 — 커밋 로직이 collector에만 있으면
 * 같은 일을 두 언어로 만들지 않아도 되고, GitHub 토큰도 한 곳에만 두면 된다.
 */
import { readDeviceSession } from './deviceSession'
import type { EventSourceLabel } from './events'

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
/** 행사 수집은 판매처 행사 페이지 백여 개를 차례로 읽는다(수십 초) — 보통 요청보다 넉넉히 기다린다. */
const COLLECT_EVENTS_TIMEOUT_MILLISECONDS = 120_000
/** 행사 올리기는 남의 서버에서 이미지를 받아(최대 30초) 굽고 커밋까지 한다 — 보통 요청보다 넉넉히 기다린다. */
const FEATURE_EVENT_TIMEOUT_MILLISECONDS = 60_000
/** 이미지 찾기는 행사 페이지와 공식 사이트 몇 곳을 연다. 창을 연 사람을 오래 세워 두지 않게 짧게 끊는다 — 못 찾으면 직접 넣으면 된다. */
const SUGGEST_EVENT_IMAGE_TIMEOUT_MILLISECONDS = 20_000

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

/** 행사 수집 결과. collector의 /api/events/collect 응답 모양이다. */
export interface EventCollectionResult {
  /** 판매처에서 읽은 행사 수(지난 행사·개발 외 행사 포함). */
  readCount: number
  unreadPageCount: number
  /** 사이트 목록(events.json)에 실은 행사 수. 반영을 건너뛰었으면 0. */
  listedCount: number
  /** 사이트 파일이 실제로 바뀌었는지. 목록이 그대로면 false 가 정상이다. */
  hasSiteChanged: boolean
  /** 반영을 건너뛴 이유(판매처가 막혔을 때 등). */
  skippedReason: string | null
}

/** daily 는 급상승 — 오늘 늘어난 별. collector 가 3시간마다 다시 쌓는다. */
export type ChartPeriod = 'weekly' | 'monthly' | 'daily'

/** 인기 저장소 차트의 한 칸. collector의 /api/admin/repository-chart 응답 모양이다. */
export interface RankedRepository {
  rank: number
  /** 지난 차트의 순위. 지난 차트에 없었으면 null(NEW). */
  previousRank: number | null
  repository: {
    /** owner/name */
    fullName: string
    url: string
    description: string | null
    language: string | null
    totalStars: number
    /** 기간 동안 늘어난 별. 순위의 기준이다. */
    starsGained: number
  }
}

export interface RepositoryChart {
  period: 'WEEKLY' | 'MONTHLY' | 'DAILY'
  /** YYYY-MM-DD */
  chartDate: string
  /** 비교한 지난 차트 날짜. 첫 차트면 null. */
  previousChartDate: string | null
  entries: RankedRepository[]
}

/** 이벤트 페이지에 올린 행사. collector의 /api/admin/events/featured 응답 모양이다. */
export interface FeaturedEvent {
  id: string
  /** 사이트 기준 경로(/events/x.avif)나 R2 전체 주소. */
  image: string
}

/** 올리기 창에 미리 채울 이미지. 티켓타코 행사 본문에 적힌 공식 사이트의 대표 이미지(og:image)다. */
export interface EventImageSuggestion {
  officialSiteUrl: string
  imageUrl: string
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

/** 주요 회사 조직이 공개한 저장소 하나(포크 제외). collector 의 /api/admin/company-repositories 응답 모양이다. */
export interface CompanyRepository {
  organization: string
  name: string
  fullName: string
  url: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  isArchived: boolean
  pushedAt: string | null
  createdAt: string | null
}

/** 회사 목록 한 줄. 아직 한 번도 못 모은 회사는 저장소 0개·collectedAt null 이다. */
export interface CompanySummary {
  company: string
  login: string
  repositoryCount: number
  totalStars: number
  topRepository: CompanyRepository | null
  lastPushedAt: string | null
  collectedAt: string | null
}

/** 판매처를 한 번 읽은 기록. isCollected 가 false 면 못 읽어 이미 실린 행사를 그대로 둔 날이다. */
export interface EventSourceRun {
  source: 'TICKETA' | 'EVENTUS' | 'DEV_EVENT'
  ranAt: string
  isCollected: boolean
  /** 판매처에서 읽은 행사(지난 행사·개발 외 포함) */
  readCount: number
  unreadCount: number
  endedCount: number
  offTopicCount: number
  /** 다른 판매처에 같은 행사가 있어 뺀 수 */
  duplicateCount: number
  listedCount: number
  message: string | null
}

/** 행사 수집처 하나. collector 의 /api/admin/event-sources 응답 모양이다. */
export interface EventSourceSummary {
  key: string
  label: string
  homepageUrl: string
  /** 지금 사이트에 실린 이 판매처 행사 수 */
  listedNow: number
  /** 최근 것부터 */
  recentRuns: EventSourceRun[]
  /** 끈 판매처는 매일 수집에서 빠진다. */
  enabled: boolean
}

/** 검증을 기다리는 행사. collector 의 /api/admin/events/candidates/pending 응답 모양이다. 날짜·시각은 한국 기준. */
export interface EventCandidate {
  id: string
  title: string
  url: string
  host: string
  startDate: string
  startTime: string
  endDate: string
  place: string | null
  isOnline: boolean
  lowestPrice: number | null
  highestPrice: number | null
  source: EventSourceLabel
  firstSeenAt: string
  /**
   * 수집할 때 찾아 둔 공식 사이트 대표 이미지. 못 찾았으면 null.
   * collector 가 이 필드를 싣기 전(feat/event-image-at-collect 배포 전)에는 없다.
   */
  imageUrl?: string | null
}

/** 채용공고를 받아오는 회사 하나(collector job_source). boardType 은 채용 시스템 종류다. */
export interface JobSource {
  companyKey: string
  companyName: string
  boardType: string
  boardUrl: string
  homepageUrl: string
  /** 끈 회사는 매일 수집에서 빠진다. */
  enabled: boolean
}

/** 회사 하나를 한 번 수집한 결과. failureMessage 가 있으면 그 회사는 실패했고 기존 공고는 그대로다. */
export interface CompanyJobResult {
  companyKey: string
  companyName: string
  fetchedCount: number
  addedCount: number
  closedCount: number
  bodyCount: number
  skippedEmpty: boolean
  failureMessage: string | null
}


/** 회사 하나는 목록과 새 공고 본문까지 받아 보통 수십 초, 공고가 많은 곳(쿠팡 120여 건)은 더 걸린다. */
const COMPANY_JOB_COLLECTION_TIMEOUT_MILLISECONDS = 110_000

/** 동아리 모집 한 번. 시각은 한국 시각 ISO-8601 이다. 시작·마감이 둘 다 null 이면 기간은 모르고 지금 모집 중이다(프로그라피). */
export interface ClubRecruitment {
  title: string
  generation: number | null
  applyStartAt: string | null
  applyEndAt: string | null
  pageUrl: string
}

/**
 * 사람이 일정을 적는 곳의 모집 페이지를 마지막으로 본 결과. collector 가 매일 보이는 글자의 지문을 어제와 견준다.
 * changedAt 은 처음 본 날 비어 있다(기준만 잡는다). hasUnacknowledgedChange 면 바뀐 뒤 아무도 '확인했어요'를 누르지 않았다.
 */
export interface ClubPageCheck {
  checkedAt: string
  isOk: boolean
  message: string | null
  changedAt: string | null
  acknowledgedAt: string | null
  hasUnacknowledgedChange: boolean
}

/** 동아리 하나의 마지막 확인 결과와 쌓인 모집(시작이 늦은 것부터). check 는 자동으로 읽는 곳, pageCheck 는 사람이 적는 곳의 것이다. */
export interface ClubRecruitments {
  clubKey: string
  check: { checkedAt: string; isOk: boolean; foundCount: number; message: string | null } | null
  pageCheck: ClubPageCheck | null
  recruitments: ClubRecruitment[]
}

export const collector = {
  listClubRecruitments: () => request<ClubRecruitments[]>('/api/admin/clubs/recruitments'),

  /** 모집 일정을 자동으로 읽을 수 있는 동아리와 켜짐 여부. */
  listClubSources: () => request<{ clubKey: string; enabled: boolean }[]>('/api/admin/clubs/sources'),

  setClubEnabled: (clubKey: string, enabled: boolean) =>
    request<{ clubKey: string; enabled: boolean }>(`/api/admin/clubs/${encodeURIComponent(clubKey)}/enabled`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),

  collectClubRecruitments: () =>
    request<{ clubKey: string; isOk: boolean; foundCount: number; message: string | null }[]>('/api/clubs/collect', {
      method: 'POST',
    }),

  /** 사람이 일정을 적는 곳의 모집 페이지가 바뀌었는지 지금 본다. 매일 08:45 DAG 가 모집 일정 수집 다음에 부르는 것과 같다. */
  checkClubPages: () =>
    request<{ clubKey: string; isOk: boolean; isChanged: boolean; message: string | null }[]>('/api/clubs/pages/check', {
      method: 'POST',
    }),

  acknowledgeClubPageChange: (clubKey: string) =>
    request<ClubPageCheck>(`/api/admin/clubs/${encodeURIComponent(clubKey)}/page-change/acknowledge`, { method: 'PUT' }),

  /** 끈 회사까지 전부. /api/jobs/sources 는 켜 둔 회사만 준다. */
  listJobSources: () => request<JobSource[]>('/api/admin/jobs/sources'),

  setJobSourceEnabled: (companyKey: string, enabled: boolean) =>
    request<JobSource>(`/api/admin/jobs/sources/${encodeURIComponent(companyKey)}/enabled`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),

  /** 회사 하나를 지금 다시 받는다. 수집처 화면이 회사를 하나씩 차례로 부르며 진행을 보여 준다. */
  collectCompanyJobs: (companyKey: string) =>
    request<CompanyJobResult>(
      `/api/jobs/collect?company=${encodeURIComponent(companyKey)}`,
      { method: 'POST' },
      COMPANY_JOB_COLLECTION_TIMEOUT_MILLISECONDS,
    ),


  listPendingEvents: () => request<EventCandidate[]>('/api/admin/events/candidates/pending'),


  rejectEvents: (eventIds: string[]) =>
    request<{ affectedEventCount: number }>('/api/admin/events/candidates/reject', {
      method: 'POST',
      body: JSON.stringify({ eventIds }),
    }),

  listEventSources: () => request<EventSourceSummary[]>('/api/admin/event-sources'),

  setEventSourceEnabled: (key: string, enabled: boolean) =>
    request<{ key: string; label: string; enabled: boolean }>(`/api/admin/event-sources/${encodeURIComponent(key)}/enabled`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),

  listCompanySummaries: () => request<CompanySummary[]>('/api/admin/company-repositories'),

  listCompanyRepositories: (login: string) =>
    request<CompanyRepository[]>(`/api/admin/company-repositories/${encodeURIComponent(login)}`),

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

  /** 이름·피드 주소를 고친다. blogKey 는 그대로라 지난 글이 같은 블로그에 남는다. */
  updateBlog: (blogKey: string, blogName: string, feedUrl: string) =>
    request<BlogFeed>(`/api/admin/feeds/${encodeURIComponent(blogKey)}`, {
      method: 'PUT',
      body: JSON.stringify({ blogName, feedUrl }),
    }),

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

  /** 새로 모은 행사를 한 번에 올린다 — 후보 등록(events.json)과 이벤트 페이지 반영(featured.json)을 함께 한다. */
  publishEvent: (eventId: string, imageUrl: string) =>
    request<FeaturedEvent>(
      `/api/admin/events/${encodeURIComponent(eventId)}/publish`,
      { method: 'POST', body: JSON.stringify({ imageUrl }) },
      FEATURE_EVENT_TIMEOUT_MILLISECONDS,
    ),

  /** 공식 사이트에서 찾은 이미지. 못 찾으면 undefined(204). */
  suggestEventImage: (eventId: string) =>
    request<EventImageSuggestion | undefined>(
      `/api/admin/events/${encodeURIComponent(eventId)}/image-suggestion`,
      undefined,
      SUGGEST_EVENT_IMAGE_TIMEOUT_MILLISECONDS,
    ),

  unfeatureEvent: (eventId: string) =>
    request<{ removed: boolean }>(`/api/admin/events/${encodeURIComponent(eventId)}/feature`, { method: 'DELETE' }),

  /** 가장 최근 인기 저장소 차트. 아직 쌓인 차트가 없으면 undefined(204). */
  getRepositoryChart: (period: ChartPeriod) =>
    request<RepositoryChart | undefined>(`/api/admin/repository-chart?period=${period}`),

  /** 행사 판매처를 지금 다시 읽어 사이트 목록을 맞춘다. 매일 08:30 DAG 가 하는 일을 바로 한 번 한다. */
  collectEvents: () =>
    request<EventCollectionResult>('/api/events/collect', { method: 'POST' }, COLLECT_EVENTS_TIMEOUT_MILLISECONDS),
}
