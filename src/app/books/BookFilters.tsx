'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, FilterSelect } from '@/shared'
import * as shared from '@/components/shared.css'
import type { BookSourceKey } from '@/lib/books'
import { booksHref, type BookFilterValues } from './booksHref'
import * as styles from '../coding/candidates/candidates.css'

const SOURCES: { value: BookSourceKey; label: string }[] = [
  { value: 'aladin', label: '알라딘' },
  { value: 'yes24', label: 'YES24' },
  { value: 'amazon', label: 'Amazon' },
]

export function BookFilters({ values }: { values: BookFilterValues }) {
  const router = useRouter()
  const [keyword, setKeyword] = useState(values.keyword)

  const apply = (next: Partial<BookFilterValues>) => router.replace(booksHref({ ...values, ...next }))

  return (
    <div className={styles.filters}>
      <FilterSelect
        label="수집처"
        options={SOURCES}
        value={values.source}
        onChange={(source) => apply({ source: source as BookSourceKey | null })}
      />
      <form
        className={styles.search}
        onSubmit={(event) => {
          event.preventDefault()
          apply({ keyword: keyword.trim() })
        }}
      >
        <input
          className={shared.input}
          type="search"
          value={keyword}
          placeholder="제목·저자·출판사 (예: 클로드, 길벗)"
          aria-label="제목·저자·출판사 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Button type="submit" size="small" variant="weak">
          찾기
        </Button>
      </form>
    </div>
  )
}
