'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, FilterSelect } from '@/shared'
import * as shared from '@/components/shared.css'
import type { CodingSourceKey } from '@/lib/collector'
import { candidatesHref, type CandidateFilterValues } from './candidatesHref'
import * as styles from './candidates.css'

const SOURCES: { value: CodingSourceKey; label: string }[] = [
  { value: 'programmers', label: '프로그래머스' },
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'codeforces', label: 'Codeforces' },
  { value: 'solved_ac', label: 'solved.ac(백준)' },
]

const LEVELS = [
  { value: '1', label: '쉬움' },
  { value: '2', label: '보통' },
  { value: '3', label: '어려움' },
]

export function CandidateFilters({ values }: { values: CandidateFilterValues }) {
  const router = useRouter()
  const [keyword, setKeyword] = useState(values.keyword)

  const apply = (next: Partial<CandidateFilterValues>) => router.replace(candidatesHref({ ...values, ...next }))

  return (
    <div className={styles.filters}>
      <FilterSelect
        label="수집처"
        options={SOURCES}
        value={values.source}
        onChange={(source) => apply({ source: source as CodingSourceKey | null })}
      />
      <FilterSelect
        label="난이도"
        options={LEVELS}
        value={values.level ? String(values.level) : null}
        onChange={(level) => apply({ level: level ? Number(level) : null })}
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
          placeholder="제목·태그 (예: 카카오, dp)"
          aria-label="제목·태그 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Button type="submit" size="small" variant="weak">
          찾기
        </Button>
      </form>
    </div>
  )
}
