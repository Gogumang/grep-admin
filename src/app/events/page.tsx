import { collector } from '@/lib/collector'
import { listSiteEvents, todayInSeoul } from '@/lib/events'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { Result } from '@/shared'
import { EventRow } from './EventRow'
import * as styles from './events.css'
import { PendingEventsList } from './PendingEventsList'

export const dynamic = 'force-dynamic'

/**
 * 행사 검증. 판매처(티켓타코·이벤터스)에서 모은 행사가 사이트에 나가기 전까지 거치는 두 단계를 한 화면에서 본다.
 *   새로 모은 행사(검증 대기) → 올리면 사이트 후보('이미지를 기다리는 행사') → 이미지를 붙여 올리면 '공개한 행사'
 * 자동으로 올라가는 단계는 없다.
 */
export default async function EventReviewPage() {
  await requireAdmin()

  // 두 목록은 서로 다른 곳에서 읽는다 — 하나가 잠깐 안 되면 그 영역만 알리고 나머지는 그린다.
  const [pending, siteEvents] = await Promise.allSettled([collector.listPendingEvents(), listSiteEvents()])
  const today = todayInSeoul()
  const candidates =
    siteEvents.status === 'fulfilled'
      ? siteEvents.value.filter((event) => !event.isFeatured && event.endDate >= today)
      : []

  return (
    <>
      <h1 className={console.pageTitle}>행사 검증{pending.status === 'fulfilled' ? ` ${pending.value.length}건` : ''}</h1>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        collector가 매일 08:30 판매처(티켓타코·이벤터스)에서 모은 행사는 &lsquo;새로 모은 행사&rsquo;에 쌓여요. 후보로 올리면
        &lsquo;이미지를 기다리는 행사&rsquo;로 내려가고, 거기서 이미지를 붙여 올린 행사만 사이트 이벤트 페이지에 나가요.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>새로 모은 행사 {pending.status === 'fulfilled' ? pending.value.length : ''}</h2>
        {pending.status === 'rejected' ? (
          <p className={shared.errorNotice}>{(pending.reason as Error).message}</p>
        ) : (
          <PendingEventsList events={pending.value} />
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>이미지를 기다리는 행사 {candidates.length}</h2>
        {siteEvents.status === 'rejected' ? (
          <p className={shared.errorNotice}>{(siteEvents.reason as Error).message}</p>
        ) : (
          <div className={shared.card}>
            {candidates.length === 0 ? (
              <Result title="이미지를 기다리는 행사가 없어요" description="새로 모은 행사를 후보로 올리면 여기에 나와요." />
            ) : (
              candidates.map((event) => <EventRow key={event.id} event={event} isEnded={false} />)
            )}
          </div>
        )}
      </section>
    </>
  )
}
