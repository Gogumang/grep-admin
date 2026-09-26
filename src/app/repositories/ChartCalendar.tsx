'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChartPeriod } from '@/lib/collector'
import * as styles from './ChartCalendar.css'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const DAYS_IN_WEEK = 7

/** 날짜는 모두 YYYY-MM-DD 문자열로 다룬다. Date 로 바꾸면 시간대에 따라 하루가 밀린다. */
function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseKey(key: string): { year: number; month: number; day: number } {
  const [year = 0, month = 1, day = 1] = key.split('-').map(Number)
  return { year, month: month - 1, day }
}

/** 월요일에 시작하는 한 주의 날짜 일곱 개. */
function weekOf(key: string): string[] {
  const { year, month, day } = parseKey(key)
  const mondayOffset = (new Date(Date.UTC(year, month, day)).getUTCDay() + 6) % DAYS_IN_WEEK
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
    const each = new Date(Date.UTC(year, month, day - mondayOffset + index))
    return toKey(each.getUTCFullYear(), each.getUTCMonth(), each.getUTCDate())
  })
}

/** 달력 한 장 — 그달 1일이 든 주 월요일부터 말일이 든 주 일요일까지. 앞뒤 달 날짜는 null 로 비운다. */
function monthGrid(year: number, month: number): (string | null)[] {
  const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % DAYS_IN_WEEK
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: lastDay }, (_, index) => toKey(year, month, index + 1)),
  ]
  while (cells.length % DAYS_IN_WEEK !== 0) cells.push(null)
  return cells
}

interface ChartCalendarProps {
  period: ChartPeriod
  /** 지금 보고 있는 차트의 날. */
  chartDate: string
  /** 차트가 쌓인 날(오래된 날부터). 없는 날은 고를 수 없다. */
  chartDates: string[]
}

/**
 * 지난 차트를 고르는 달력. 급상승·월간은 날을, 주간은 한 주를 고른다.
 * 주간 차트도 날마다 쌓이므로(그날 기준 최근 1주) 한 주를 고르면 그 주에 쌓인 마지막 차트를 보인다.
 * 고른 날은 주소(?date=)에 둔다 — 새로 고치거나 링크로 들어와도 그 차트가 열린다.
 */
export function ChartCalendar({ period, chartDate, chartDates }: ChartCalendarProps) {
  const router = useRouter()
  const initial = parseKey(chartDate)
  const [shown, setShown] = useState({ year: initial.year, month: initial.month })

  const available = new Set(chartDates)
  const isWeekly = period === 'weekly'
  const selectedDays = new Set(isWeekly ? weekOf(chartDate) : [chartDate])
  const latest = chartDates.at(-1)

  // 주간은 그 주에 쌓인 마지막 날, 나머지는 그날 차트를 연다.
  const targetOf = (key: string): string | undefined =>
    isWeekly ? weekOf(key).filter((day) => available.has(day)).at(-1) : available.has(key) ? key : undefined

  // 최신 차트는 주소에 날짜를 남기지 않는다 — 내일 들어와도 그날 최신이 열리게.
  const open = (target: string) => {
    const query = target === latest ? '' : `&date=${target}`
    router.replace(`/repositories?period=${period}${query}`)
  }

  const first = chartDates[0] ? parseKey(chartDates[0]) : initial
  const last = latest ? parseKey(latest) : initial
  const monthIndex = shown.year * 12 + shown.month
  const hasPreviousMonth = monthIndex > first.year * 12 + first.month
  const hasNextMonth = monthIndex < last.year * 12 + last.month
  const move = (step: number) => {
    const next = monthIndex + step
    setShown({ year: Math.floor(next / 12), month: next % 12 })
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button type="button" className={styles.navigation} onClick={() => move(-1)} disabled={!hasPreviousMonth} aria-label="이전 달">
          ‹
        </button>
        <span className={styles.monthLabel}>
          {shown.year}년 {shown.month + 1}월
        </span>
        <button type="button" className={styles.navigation} onClick={() => move(1)} disabled={!hasNextMonth} aria-label="다음 달">
          ›
        </button>
      </div>

      <div className={styles.grid} aria-label={isWeekly ? '주 고르기' : '날짜 고르기'}>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className={styles.weekday}>
            {weekday}
          </span>
        ))}
        {monthGrid(shown.year, shown.month).map((key, index) => {
          if (!key) return <span key={`blank-${index}`} />
          const target = targetOf(key)
          const isSelected = selectedDays.has(key)
          return (
            <button
              key={key}
              type="button"
              className={[
                styles.day,
                available.has(key) ? styles.hasChart : '',
                isSelected ? (isWeekly ? styles.selectedWeek : styles.selected) : '',
              ].join(' ')}
              disabled={!target}
              aria-pressed={isSelected}
              aria-label={isWeekly ? `${key}이 든 주` : key}
              onClick={() => target && open(target)}
            >
              {parseKey(key).day}
            </button>
          )
        })}
      </div>

      <p className={styles.hint}>
        {isWeekly ? '날을 누르면 그 주에 쌓인 마지막 차트를 보여요.' : '점이 있는 날만 차트가 있어요.'}
        {latest && chartDate !== latest && (
          <>
            {' '}
            <button type="button" className={styles.latestLink} onClick={() => open(latest)}>
              최신 차트로
            </button>
          </>
        )}
      </p>
    </div>
  )
}
