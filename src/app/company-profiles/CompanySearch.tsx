'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  financialsUnverifiedReason,
  formatCount,
  formatWon,
  HEADCOUNT_UNVERIFIED_REASON,
  matchesCompanySearch,
  MISSING_ACCOUNT_REASON,
  type CompanyProfileSummary,
} from '@/lib/companyProfiles'
import * as shared from '@/components/shared.css'
import { Unverified } from './YearlyAmountChart'
import * as styles from './companyProfiles.css'

function companyHref(companyId: string): string {
  return `/company-profiles/${encodeURIComponent(companyId)}`
}

function Count({ value }: { value: number | null }) {
  return value === null ? <Unverified reason={HEADCOUNT_UNVERIFIED_REASON} /> : <>{formatCount(value)}</>
}

function Money({ summary, amount }: { summary: CompanyProfileSummary; amount: number | null }) {
  if (summary.latestFinancials === null) return <Unverified reason={financialsUnverifiedReason(summary.company)} />
  if (amount === null) return <Unverified reason={MISSING_ACCOUNT_REASON} />
  return <span className={amount < 0 ? styles.loss : undefined}>{formatWon(amount)}</span>
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span>
      <span className={styles.factLabel}>{label}</span>
      {children}
    </span>
  )
}

/**
 * 회사 검색. 화면 이름(토스)·법인명(비바리퍼블리카)·id 로 찾는다. 검색어는 주소(?q=)에 둔다 —
 * 회사 화면에 들어갔다 뒤로 오면 찾던 결과가 그대로 있다.
 *
 * 검색어가 없으면 아무것도 늘어놓지 않는다 — 77곳 이름 칩이 검색창보다 눈에 띄어 화면이 어지러웠다.
 */
export function CompanySearch({ summaries, initialQuery }: { summaries: CompanyProfileSummary[]; initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const results = summaries
    .filter((summary) => matchesCompanySearch(summary, query))
    .sort((left, right) => left.company.name.localeCompare(right.company.name, 'ko'))

  const changeQuery = (next: string) => {
    setQuery(next)
    const trimmed = next.trim()
    router.replace(trimmed ? `/company-profiles?q=${encodeURIComponent(trimmed)}` : '/company-profiles', { scroll: false })
  }

  return (
    <>
      <input
        className={`${shared.input} ${styles.searchInput}`}
        type="search"
        placeholder="회사 이름 (토스, 비바리퍼블리카, 카카오…)"
        aria-label="회사 검색"
        autoFocus
        value={query}
        onChange={(event) => changeQuery(event.target.value)}
      />

      {query.trim() === '' ? null : results.length === 0 ? (
        <p className={styles.lead} style={{ marginTop: 16 }}>
          &lsquo;{query.trim()}&rsquo; 에 맞는 회사가 없습니다. 회사 목록에서 더할 수 있습니다.
        </p>
      ) : (
        <ul className={styles.resultList}>
          {results.map((summary) => (
            <li key={summary.company.id}>
              <a className={`${shared.card} ${styles.resultItem}`} href={companyHref(summary.company.id)}>
                <span>
                  <span className={styles.resultName}>{summary.company.name}</span>
                  {summary.corporationName && <div className={styles.hint}>{summary.corporationName}</div>}
                </span>
                <span className={styles.resultFacts}>
                  <Fact label="직원">
                    <Count value={summary.latestHeadcount?.employeeCount ?? null} />
                  </Fact>
                  <Fact label="1년 입사">
                    <Count value={summary.hiredLastYear} />
                  </Fact>
                  <Fact label="1년 퇴사">
                    <Count value={summary.leftLastYear} />
                  </Fact>
                  <Fact label={summary.latestFinancials ? `${summary.latestFinancials.fiscalYear} 매출` : '매출'}>
                    <Money summary={summary} amount={summary.latestFinancials?.revenue ?? null} />
                  </Fact>
                  <Fact label="영업이익">
                    <Money summary={summary} amount={summary.latestFinancials?.operatingIncome ?? null} />
                  </Fact>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
