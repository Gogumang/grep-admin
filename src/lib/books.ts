import { request } from './collector'

/** 책을 가져오는 곳. collector 의 BookSourceKind.key 와 같아야 한다. */
export type BookSourceKey = 'aladin' | 'yes24' | 'amazon'

/** 수집처를 한 번 읽은 기록. isCollected 가 false 면 못 읽은 날이다 — 쌓아 둔 책은 그대로다. */
export interface BookSourceRun {
  key: BookSourceKey
  ranAt: string
  isCollected: boolean
  readCount: number
  newCount: number
  message: string | null
}

/** 수집처 하나. collector 의 GET /api/admin/books/sources 응답 모양이다. */
export interface BookSourceSummary {
  key: BookSourceKey
  label: string
  homepageUrl: string
  bookCount: number
  /** 최근 것부터 */
  recentRuns: BookSourceRun[]
  enabled: boolean
}

/** 쌓아 둔 책 하나. *Label 은 그곳 표기 그대로다(출간일 2026-08-20 · 2026년 08월, 가격 28,800원 · $39.99). */
export interface Book {
  source: BookSourceKey
  sourceLabel: string
  externalId: string
  title: string
  url: string
  authors: string | null
  publisher: string | null
  publishedLabel: string | null
  priceLabel: string | null
  isbn13: string | null
  /** 우리 저장소(R2)에 둔 표지. 받지 못했으면 null. */
  coverUrl: string | null
  firstSeenAt: string
  lastSeenAt: string
}

export interface BookPage {
  books: Book[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BookFilter {
  source?: BookSourceKey
  keyword?: string
  page: number
}

const BOOKS_PATH = '/api/admin/books'

/**
 * 처음 수집은 새 책 수백 권의 표지를 받아 굽느라 몇 분 걸린다. 화면(maxDuration 300초)보다 조금 짧게 둔다 —
 * 시간을 넘겨도 collector 는 하던 수집을 끝까지 하고, 다음에 열면 쌓인 책이 보인다.
 */
const COLLECT_BOOKS_TIMEOUT_MILLISECONDS = 280_000

export const books = {
  listSources: () => request<BookSourceSummary[]>(`${BOOKS_PATH}/sources`),

  setSourceEnabled: (key: BookSourceKey, enabled: boolean) =>
    request<{ key: BookSourceKey; label: string; enabled: boolean }>(`${BOOKS_PATH}/sources/${encodeURIComponent(key)}/enabled`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),

  /** 켜 둔 수집처를 지금 읽는다. 다 읽을 때까지 기다리고 수집처마다 결과를 준다. */
  collect: () => request<BookSourceRun[]>(`${BOOKS_PATH}/sources/collect`, { method: 'POST' }, COLLECT_BOOKS_TIMEOUT_MILLISECONDS),

  list: (filter: BookFilter) => {
    const query = new URLSearchParams({ page: String(filter.page) })
    if (filter.source) query.set('source', filter.source)
    if (filter.keyword) query.set('keyword', filter.keyword)
    return request<BookPage>(`${BOOKS_PATH}?${query}`)
  },
}
