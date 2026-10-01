import type { BookSourceKey } from '@/lib/books'

export interface BookFilterValues {
  source: BookSourceKey | null
  keyword: string
}

/**
 * 책 목록 주소. 조건을 주소에 둔다 — 새로 고치거나 링크로 들어와도 보던 목록이 그대로 열린다.
 *
 * 필터(클라이언트)와 쪽 넘기기(서버 페이지)가 함께 쓴다 — 'use client' 모듈이 내보낸 함수는 서버에서 부를 수 없어 따로 둔다.
 */
export function booksHref(values: BookFilterValues, page = 1): string {
  const query = new URLSearchParams()
  if (values.source) query.set('source', values.source)
  if (values.keyword) query.set('keyword', values.keyword)
  if (page > 1) query.set('page', String(page))
  const text = query.toString()
  return text ? `/books?${text}` : '/books'
}
