import { Badge, ListRow, Result } from '@/shared'
import type { SiteEvent } from '@/lib/events'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from './events.css'

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
    />
  )
}

/** 목록을 그리기만 한다. 오늘을 밖에서 받아, 끝난 행사를 가르는 기준을 호출하는 쪽이 정한다. */
export function EventsView({ events, today }: { events: SiteEvent[]; today: string }) {
  const upcoming = events.filter((event) => event.endDate >= today)
  // 끝난 행사는 최근에 끝난 것부터 — 방금 지나간 행사가 맨 아래 묻히지 않게 한다.
  const ended = events.filter((event) => event.endDate < today).reverse()
  const featuredCount = upcoming.filter((event) => event.isFeatured).length

  return (
    <>
      <h1 className={console.pageTitle}>
        행사 {upcoming.length}건 · 사이트에 올림 {featuredCount}건
      </h1>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        collector가 매일 08:30 티켓타코에서 모읍니다. 사이트에는 grep 저장소 featured.ts 에 적은 행사만 나갑니다.
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
            <h2 className={styles.sectionTitle}>다가오는 행사</h2>
            <div className={shared.card}>
              {upcoming.map((event) => (
                <EventRow key={event.id} event={event} isEnded={false} />
              ))}
            </div>
          </section>
          {ended.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>끝난 행사</h2>
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
