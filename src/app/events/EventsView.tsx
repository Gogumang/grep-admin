import { Badge, ListRow, Result } from '@/shared'
import type { SiteEvent } from '@/lib/events'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from './events.css'
import { EventFeatureControl } from './EventFeatureControl'
import { RefreshEventsButton } from './RefreshEventsButton'

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

function EventRow({ event, isEnded }: { event: SiteEvent; isEnded: boolean }) {
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

/** 목록을 그리기만 한다. 오늘을 밖에서 받아, 끝난 행사를 가르는 기준을 호출하는 쪽이 정한다. */
export function EventsView({ events, today }: { events: SiteEvent[]; today: string }) {
  const upcoming = events.filter((event) => event.endDate >= today)
  // 사이트 이벤트 페이지와 같은 목록이다 — 다가오는 행사 중 올린 것만. 둘을 나란히 열어 대조할 수 있어야 한다.
  const onSite = upcoming.filter((event) => event.isFeatured)
  const notOnSite = upcoming.filter((event) => !event.isFeatured)
  // 끝난 행사는 최근에 끝난 것부터 — 방금 지나간 행사가 맨 아래 묻히지 않게 한다.
  const ended = events.filter((event) => event.endDate < today).reverse()

  return (
    <>
      <div className={styles.header}>
        <h1 className={console.pageTitle}>사이트에 나가는 행사 {onSite.length}건</h1>
        <RefreshEventsButton />
      </div>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        사이트 이벤트 페이지에는 여기서 올린 행사만 나갑니다. 아래 &lsquo;올리지 않은 행사&rsquo;는 collector가 매일 08:30
        티켓타코에서 모은 후보입니다.
      </p>

      {events.length === 0 ? (
        <div className={shared.card}>
          <Result
            figure={<img src="/illustrations/empty.png" alt="" width={100} height={100} />}
            title="모은 행사가 없어요"
            description="collector가 티켓타코에서 행사를 모으면 여기에 나와요."
          />
        </div>
      ) : (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>사이트에 나가는 행사 {onSite.length}</h2>
            <div className={shared.card}>
              {onSite.length === 0 ? (
                <Result title="사이트에 올린 행사가 없어요" description="아래 후보에서 올리면 이벤트 페이지에 나가요." />
              ) : (
                onSite.map((event) => <EventRow key={event.id} event={event} isEnded={false} />)
              )}
            </div>
          </section>
          {notOnSite.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>올리지 않은 행사 {notOnSite.length}</h2>
              <div className={shared.card}>
                {notOnSite.map((event) => (
                  <EventRow key={event.id} event={event} isEnded={false} />
                ))}
              </div>
            </section>
          )}
          {ended.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>끝난 행사 {ended.length}</h2>
              <div className={shared.card}>
                {ended.map((event) => (
                  <EventRow key={event.id} event={event} isEnded />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
