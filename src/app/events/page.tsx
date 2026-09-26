import { collector } from '@/lib/collector'
import { listSiteEvents, todayInSeoul } from '@/lib/events'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from './events.css'
import { WaitingEventsList } from './WaitingEventsList'

export const dynamic = 'force-dynamic'

/**
 * 행사 검증. 판매처(티켓타코·이벤터스), Dev-Event(해커톤), Meetup·Luma(서울 개발 모임)에서 모은 행사를 사람이 보고 이미지를 넣어 올리거나 치운다.
 *   검토를 기다리는 행사 → 올리기(이미지 확인) → '공개한 행사'
 * 두 단계로 나뉘어 있던 때(2026-09-25 전) 후보로만 올려 둔 사이트 행사도 같은 목록에 섞여 보인다 — 남아 있을 때만.
 * 자동으로 올라가는 단계는 없다.
 */
export default async function EventReviewPage() {
  await requireAdmin()

  // 두 목록은 서로 다른 곳에서 읽는다 — 하나가 잠깐 안 되면 그 실패만 알리고 나머지로 목록을 그린다.
  const [pending, siteEvents, published] = await Promise.allSettled([
    collector.listPendingEvents(),
    listSiteEvents(),
    collector.listPublishedEvents(),
  ])
  const today = todayInSeoul()
  // 썸네일은 보조다 — 게시 행사를 못 읽으면 후보를 이미지 없이 그린다. 알릴 만큼의 실패가 아니다.
  const imageById = new Map(
    published.status === 'fulfilled' ? published.value.map((event) => [event.id, event.imageUrl ?? null]) : [],
  )
  const candidates =
    siteEvents.status === 'fulfilled'
      ? siteEvents.value
          .filter((event) => !event.isFeatured && event.endDate >= today)
          .map((event) => ({ ...event, imageUrl: imageById.get(event.id) ?? null }))
      : []

  const pendingEvents = pending.status === 'fulfilled' ? pending.value : []
  const waitingCount = pendingEvents.length + candidates.length

  return (
    <>
      <h1 className={console.pageTitle}>행사 검증 {waitingCount}건</h1>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        collector가 매일 08:30 판매처(티켓타코·이벤터스), Dev-Event(해커톤), Meetup·Luma(서울 개발 모임)에서 모은 행사가 &lsquo;검토를 기다리는 행사&rsquo;에 쌓여요.
        모을 때 공식 사이트(Meetup·Luma는 그 행사 페이지) 이미지를 미리 찾아 두고, &lsquo;올리기&rsquo;를 누르면 그 이미지를 채워 보여 줘요.
        공식 사이트 이미지가 없는 티켓타코·이벤터스 행사는 판매처 페이지 이미지를 채우고 출처를 알려 줘요 — 쓸지는 직접 정해요.
        확인하면 바로 사이트 이벤트 페이지에 나가요.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>검토를 기다리는 행사 {waitingCount}</h2>
        {pending.status === 'rejected' && <p className={shared.errorNotice}>{(pending.reason as Error).message}</p>}
        {siteEvents.status === 'rejected' && <p className={shared.errorNotice}>{(siteEvents.reason as Error).message}</p>}
        {/* 둘 다 못 읽었으면 목록을 그리지 않는다 — 빈 목록 안내가 '기다리는 행사 없음'으로 읽힌다. */}
        {(pending.status === 'fulfilled' || siteEvents.status === 'fulfilled') && (
          <WaitingEventsList pendingEvents={pendingEvents} siteCandidates={candidates} />
        )}
      </section>
    </>
  )
}
