import type { ReactNode } from 'react'
import { Badge, ListRow } from '@/shared'
import type { SiteEvent } from '@/lib/events'
import * as styles from './events.css'
import { EventFeatureControl } from './EventFeatureControl'

/** YYYY-MM-DD → 9/14(월). 행사는 요일이 중요하다 — 평일이면 휴가를 내야 한다. */
function shortDate(date: string): string {
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  )
}

/**
 * 한 줄에 그리는 데 필요한 몫. 새로 모은 행사(collector 후보)는 사이트에 없어 이미지·올림 여부가 없다 —
 * 두 목록이 같은 줄 모양을 쓰도록 공통 필드만 받는다.
 */
type EventSummary = Pick<
  SiteEvent,
  'title' | 'url' | 'host' | 'startDate' | 'startTime' | 'endDate' | 'place' | 'isOnline' | 'lowestPrice' | 'highestPrice' | 'source'
> & { imageUrl?: string | null }

function schedule(event: EventSummary): string {
  const start = `${shortDate(event.startDate)}${event.startTime ? ` ${event.startTime}` : ''}`
  return event.endDate === event.startDate ? start : `${start} ~ ${shortDate(event.endDate)}`
}

function price(event: EventSummary): string | null {
  if (event.lowestPrice === null) return null
  if (event.lowestPrice === 0 && (event.highestPrice ?? 0) === 0) return '무료'
  return `${event.lowestPrice.toLocaleString()}원~`
}

/**
 * 행사 한 줄의 생김새(썸네일·제목·판매처·일정). 이미지가 없으면 같은 크기의 회색 자리를 둔다.
 * leading 은 썸네일 앞(고르기 칸), badges 는 판매처 뒤에 붙는 상태 표시다.
 */
export function EventListRow({
  event,
  leading,
  badges,
  right,
}: {
  event: EventSummary
  leading?: ReactNode
  badges?: ReactNode
  right?: ReactNode
}) {
  const thumbnail = event.imageUrl ? (
    <img className={styles.thumbnail} src={event.imageUrl} alt="" width={114} height={64} loading="lazy" />
  ) : (
    <span className={styles.thumbnail} />
  )
  return (
    <ListRow
      border="none"
      left={
        leading ? (
          <span className={styles.leading}>
            {leading}
            {thumbnail}
          </span>
        ) : (
          thumbnail
        )
      }
      contents={
        <ListRow.Texts
          title={
            <>
              <a className={styles.titleLink} href={event.url} target="_blank" rel="noreferrer">
                {event.title}
              </a>
              <span className={styles.badges}>
                <Badge color={event.source === '이벤터스' ? 'teal' : 'elephant'} variant="weak" size="xsmall">
                  {event.source ?? '티켓타코'}
                </Badge>
                {badges}
              </span>
            </>
          }
          description={[schedule(event), event.host, event.isOnline ? '온라인' : event.place, price(event)]
            .filter(Boolean)
            .join(' · ')}
        />
      }
      right={right}
    />
  )
}

/** 사이트 저장소에 있는 행사 한 줄. 검증 화면의 후보와 공개한 행사 화면이 같이 쓴다. */
export function EventRow({ event, isEnded, leading }: { event: SiteEvent; isEnded: boolean; leading?: ReactNode }) {
  return (
    <EventListRow
      event={event}
      leading={leading}
      badges={
        <>
          {event.isFeatured && (
            <Badge color="blue" variant="weak" size="xsmall">
              사이트에 올림
            </Badge>
          )}
          {isEnded && (
            <Badge color="elephant" variant="weak" size="xsmall">
              끝남
            </Badge>
          )}
        </>
      }
      /*
        끝난 행사는 올릴 수 없다 — 사이트가 끝난 행사를 알아서 뺀다. 올려 둔 채 끝난 행사는 목록 정리를 위해 내릴 수만 있다.
      */
      right={
        isEnded ? (
          event.isFeatured && <EventFeatureControl eventId={event.id} title={event.title} isFeatured endedOnly />
        ) : (
          <EventFeatureControl eventId={event.id} title={event.title} isFeatured={event.isFeatured} />
        )
      }
    />
  )
}
