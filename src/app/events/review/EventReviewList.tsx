'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { Badge, Button, Checkbox, ListRow, useToast } from '@/shared'
import type { EventCandidate } from '@/lib/collector'
import * as review from '../../review/ReviewWorkbench.css'
import * as styles from '../../jobs/jobReview.css'
import { type ActionResult, approveEvents, rejectEvents } from './actions'

function schedule(event: EventCandidate): string {
  const [, startMonth, startDay] = event.startDate.split('-').map(Number)
  const start = `${startMonth}/${startDay} ${event.startTime}`
  if (event.endDate === event.startDate) return start
  const [, endMonth, endDay] = event.endDate.split('-').map(Number)
  return `${start} ~ ${endMonth}/${endDay}`
}

function price(event: EventCandidate): string | null {
  if (event.lowestPrice === null) return null
  if (event.lowestPrice === 0 && (event.highestPrice ?? 0) === 0) return '무료'
  return `${event.lowestPrice.toLocaleString()}원~`
}

/**
 * 행사 검증 목록. 제목·주최만으로 판단되는 경우가 대부분이라(교육 과정·강의 판매 등) 여러 건을 골라 한 번에 처리한다.
 * 자세한 내용은 제목을 눌러 판매처 페이지에서 본다 — 설명은 약관상 옮기지 않는다.
 */
export function EventReviewList({ events }: { events: EventCandidate[] }) {
  const router = useRouter()
  const { openToast } = useToast()
  const [source, setSource] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const sources = useMemo(() => {
    const counts = new Map<string, number>()
    for (const event of events) counts.set(event.source, (counts.get(event.source) ?? 0) + 1)
    return [...counts.entries()]
  }, [events])

  const visibleEvents = source ? events.filter((event) => event.source === source) : events
  // 판매처를 바꿔도 고른 것은 남긴다. 처리 대상은 지금 보이는 행사로만 — 안 보이는 것을 함께 올리면 놀란다.
  const selectedVisibleIds = visibleEvents.filter((event) => selected.has(event.id)).map((event) => event.id)
  const isAllVisibleSelected = visibleEvents.length > 0 && selectedVisibleIds.length === visibleEvents.length

  function toggle(eventId: string, checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous)
      if (checked) next.add(eventId)
      else next.delete(eventId)
      return next
    })
  }

  function toggleAllVisible(checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous)
      for (const event of visibleEvents) {
        if (checked) next.add(event.id)
        else next.delete(event.id)
      }
      return next
    })
  }

  function run(action: (eventIds: string[]) => Promise<ActionResult>) {
    const eventIds = selectedVisibleIds
    startTransition(async () => {
      const result = await action(eventIds)
      if (!result.ok) {
        setFailure(result.message)
        return
      }
      setFailure(null)
      setSelected((previous) => new Set([...previous].filter((eventId) => !eventIds.includes(eventId))))
      openToast(result.message)
      router.refresh()
    })
  }

  if (events.length === 0) {
    return (
      <div className={review.panel}>
        <p className={review.emptyState}>검증할 행사가 없습니다. 매일 08:30 수집이 돌면 새 행사가 여기에 쌓입니다.</p>
      </div>
    )
  }

  return (
    <div className={review.listPanel}>
      <div className={styles.filterBar}>
        <Button size="small" color={source === null ? 'primary' : 'light'} onClick={() => setSource(null)}>
          전체 {events.length}
        </Button>
        {sources.map(([name, count]) => (
          <Button key={name} size="small" color={source === name ? 'primary' : 'light'} onClick={() => setSource(name)}>
            {name} {count}
          </Button>
        ))}
      </div>

      <div className={styles.actionBar}>
        <label className={styles.selectAll}>
          <Checkbox.Line size={20} checked={isAllVisibleSelected} onCheckedChange={toggleAllVisible} aria-label="보이는 행사 모두 고르기" />
          {selectedVisibleIds.length > 0 ? `${selectedVisibleIds.length}건 고름` : '모두 고르기'}
        </label>

        <span className={review.tabSpacer} />

        <Button
          color="danger"
          variant="weak"
          size="small"
          disabled={selectedVisibleIds.length === 0 || isPending}
          onClick={() => run(rejectEvents)}
        >
          치우기
        </Button>
        <Button
          color="primary"
          size="small"
          disabled={selectedVisibleIds.length === 0 || isPending}
          loading={isPending}
          onClick={() => run(approveEvents)}
        >
          고른 행사 올리기
        </Button>
      </div>

      {failure && <p className={review.errorNotice}>{failure}</p>}

      <div className={review.pendingList}>
        {visibleEvents.map((event) => (
          <ListRow
            key={event.id}
            verticalPadding="small"
            horizontalPadding="small"
            border="none"
            left={
              <Checkbox.Line
                size={20}
                checked={selected.has(event.id)}
                onCheckedChange={(checked) => toggle(event.id, checked)}
                aria-label={`${event.title} 고르기`}
              />
            }
            contents={
              <ListRow.Texts
                title={event.title}
                description={
                  <>
                    {[schedule(event), event.host, event.isOnline ? '온라인' : event.place, price(event)]
                      .filter(Boolean)
                      .join(' · ')}
                    <Badge color={event.source === '이벤터스' ? 'teal' : 'elephant'} variant="weak" size="xsmall">
                      {event.source}
                    </Badge>
                  </>
                }
              />
            }
            right={
              <Button as="a" href={event.url} target="_blank" rel="noreferrer" color="light" size="small">
                원문
              </Button>
            }
          />
        ))}
      </div>
    </div>
  )
}
