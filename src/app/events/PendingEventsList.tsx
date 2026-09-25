'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { Button, Checkbox, FilterSelect, useToast } from '@/shared'
import type { EventCandidate } from '@/lib/collector'
import * as shared from '@/components/shared.css'
import * as review from '../review/ReviewWorkbench.css'
import * as styles from '../jobs/jobReview.css'
import { type ActionResult, rejectEvents } from './actions'
import { EventFeatureControl } from './EventFeatureControl'
import { EventListRow } from './EventRow'

/**
 * 새로 모은 행사(검증 대기). 줄마다 '올리기'를 누르면 이미지 창(공식 사이트 이미지를 미리 채움)이 뜨고, 확인하면
 * 후보 등록과 이벤트 페이지 반영을 한 번에 한다. 올리지 않을 행사는 여러 건을 골라 한 번에 치운다.
 * 줄 모양은 '이미지를 기다리는 행사'(EventRow)와 같다 — 아직 이미지가 없어 썸네일 자리는 비어 있다.
 * 자세한 내용은 제목을 눌러 원문(판매처 페이지)에서 본다 — 설명은 약관상 옮기지 않는다.
 */
export function PendingEventsList({ events }: { events: EventCandidate[] }) {
  const router = useRouter()
  const { openToast } = useToast()
  const [source, setSource] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const sources = useMemo(() => [...new Set(events.map((event) => event.source))], [events])

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
      <div className={shared.card}>
        <p className={review.emptyState}>새로 모은 행사가 없습니다. 매일 08:30 수집이 돌면 여기에 쌓입니다.</p>
      </div>
    )
  }

  return (
    <div className={shared.card}>
      <div className={styles.filterBar}>
        <FilterSelect
          label="판매처"
          options={sources.map((name) => ({ value: name, label: name }))}
          value={source}
          onChange={setSource}
        />
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
      </div>

      {failure && <p className={review.errorNotice}>{failure}</p>}

      {visibleEvents.map((event) => (
        <EventListRow
          key={event.id}
          event={event}
          leading={
            <Checkbox.Line
              size={20}
              checked={selected.has(event.id)}
              onCheckedChange={(checked) => toggle(event.id, checked)}
              aria-label={`${event.title} 고르기`}
            />
          }
          right={<EventFeatureControl eventId={event.id} title={event.title} isFeatured={false} isNew />}
        />
      ))}
    </div>
  )
}
