'use client'

import { useRouter } from 'next/navigation'
import { Tab } from '@/shared'
import type { ChartPeriod } from '@/lib/collector'

const PERIODS: { key: ChartPeriod; label: string }[] = [
  { key: 'weekly', label: '주간 (1주)' },
  { key: 'monthly', label: '월간 (4주)' },
]

/** 기간은 주소(?period=)에 둔다 — 새로 고치거나 링크로 들어와도 보던 차트가 그대로 열린다. */
export function PeriodTabs({ period }: { period: ChartPeriod }) {
  const router = useRouter()

  return (
    <Tab size="small" ariaLabel="집계 기간" onChange={(_, key) => router.replace(`/repositories?period=${String(key)}`)}>
      {PERIODS.map((item) => (
        <Tab.Item key={item.key} itemKey={item.key} selected={item.key === period}>
          {item.label}
        </Tab.Item>
      ))}
    </Tab>
  )
}
