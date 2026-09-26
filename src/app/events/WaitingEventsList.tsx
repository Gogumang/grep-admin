'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { Button, Checkbox, FilterSelect, useToast } from '@/shared'
import type { EventCandidate } from '@/lib/collector'
import type { SiteEvent } from '@/lib/events'
import * as shared from '@/components/shared.css'
import * as review from '../review/ReviewWorkbench.css'
import * as styles from '../jobs/jobReview.css'
import * as eventStyles from './events.css'
import { type ActionResult, rejectEvents } from './actions'
import { EventFeatureControl } from './EventFeatureControl'
import { EventListRow, EventRow } from './EventRow'

/**
 * 검토를 기다리는 행사. 두 곳에서 온 행사를 시작일 순으로 한 목록에 섞는다.
 *  - 새로 모은 행사(collector 검증 대기): 수집할 때 찾아 둔 공식 사이트 이미지가 있으면 썸네일로 보인다. '올리기'를 누르면 이미지 창(공식 사이트 이미지를 미리 채움)이 뜨고, 확인하면
 *    후보 등록과 이벤트 페이지 반영을 한 번에 한다. 올리지 않을 행사는 여러 건을 골라 한 번에 치운다.
 *  - 두 단계로 나뉘어 있던 때(2026-09-25 전) 후보로만 올려 둔 사이트 행사: 이미지만 넣으면 된다. 치우기 대상이 아니라 고르기 칸이 없다.
 * 자세한 내용은 제목을 눌러 원문(판매처 페이지)에서 본다 — 설명은 약관상 옮기지 않는다.
 */
export function WaitingEventsList({
  pendingEvents,
  siteCandidates,
}: {
  pendingEvents: EventCandidate[]
  siteCandidates: SiteEvent[]
}) {
  const router = useRouter()
  const { openToast } = useToast()
  const [source, setSource] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const rows = useMemo(
    () =>
      [
        ...pendingEvents.map((event) => ({ kind: 'pending' as const, event, source: event.source })),
        // source 가 없는 사이트 행사는 판매처 필드가 생기기 전 것이라 티켓타코뿐이었다.
        ...siteCandidates.map((event) => ({ kind: 'site' as const, event, source: event.source ?? '티켓타코' })),
      ].sort((left, right) => left.event.startDate.localeCompare(right.event.startDate)),
    [pendingEvents, siteCandidates],
  )
  const sources = useMemo(() => [...new Set(rows.map((row) => row.source))], [rows])

  const visibleRows = source ? rows.filter((row) => row.source === source) : rows
  const visibleEvents = visibleRows.flatMap((row) => (row.kind === 'pending' ? [row.event] : []))
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

  if (rows.length === 0) {
    return (
      <div className={shared.card}>
        <p className={review.emptyState}>검토를 기다리는 행사가 없습니다. 매일 08:30 수집이 돌면 여기에 쌓입니다.</p>
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

      {visibleRows.map((row) =>
        row.kind === 'site' ? (
          <EventRow key={row.event.id} event={row.event} isEnded={false} leading={<span className={eventStyles.checkboxSpace} />} />
        ) : (
          <EventListRow
            key={row.event.id}
            event={row.event}
            leading={
              <Checkbox.Line
                size={20}
                checked={selected.has(row.event.id)}
                onCheckedChange={(checked) => toggle(row.event.id, checked)}
                aria-label={`${row.event.title} 고르기`}
              />
            }
            right={<EventFeatureControl eventId={row.event.id} title={row.event.title} isFeatured={false} isNew />}
          />
        ),
      )}
    </div>
  )
}
