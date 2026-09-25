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

function schedule(event: SiteEvent): string {
  const start = `${shortDate(event.startDate)}${event.startTime ? ` ${event.startTime}` : ''}`
  return event.endDate === event.startDate ? start : `${start} ~ ${shortDate(event.endDate)}`
}

function price(event: SiteEvent): string | null {
  if (event.lowestPrice === null) return null
  if (event.lowestPrice === 0 && (event.highestPrice ?? 0) === 0) return '무료'
  return `${event.lowestPrice.toLocaleString()}원~`
}

/** 사이트 저장소에 있는 행사 한 줄. 검증 화면의 후보와 공개한 행사 화면이 같이 쓴다. */
export function EventRow({ event, isEnded }: { event: SiteEvent; isEnded: boolean }) {
  return (
    <ListRow
      border="none"
      left={
        event.imageUrl ? (
          <img className={styles.thumbnail} src={event.imageUrl} alt="" width={114} height={64} loading="lazy" />
        ) : (
          <span className={styles.thumbnail} />
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
              </span>
            </>
          }
          description={[schedule(event), event.host, event.isOnline ? '온라인' : event.place, price(event)]
            .filter(Boolean)
            .join(' · ')}
        />
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
