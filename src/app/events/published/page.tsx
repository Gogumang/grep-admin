import { listSiteEvents, todayInSeoul } from '@/lib/events'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { Result } from '@/shared'
import { EventRow } from '../EventRow'
import * as styles from '../events.css'

export const dynamic = 'force-dynamic'

/**
 * 사이트 이벤트 페이지에 올라가 있는 행사. 이미지를 바꾸거나 잘못 올린 행사를 내리는 자리다.
 * 다가오는 행사는 사이트 목록과 같은 순서라 둘을 나란히 열어 대조할 수 있다.
 */
export default async function PublishedEventsPage() {
  await requireAdmin()

  let events
  try {
    events = await listSiteEvents()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>공개한 행사</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  const today = todayInSeoul()
  const featured = events.filter((event) => event.isFeatured)
  const onSite = featured.filter((event) => event.endDate >= today)
  // 사이트는 끝난 행사를 알아서 뺀다. 올려 둔 채 끝난 행사는 목록 정리용으로 내릴 수만 있다 — 최근에 끝난 것부터.
  const ended = featured.filter((event) => event.endDate < today).reverse()

  return (
    <>
      <h1 className={console.pageTitle}>공개한 행사</h1>

      <section className={styles.section}>
        <div className={shared.card}>
          {onSite.length === 0 ? (
            <Result title="사이트에 올린 행사가 없어요" description="행사 검증에서 이미지를 붙여 올리면 여기에 나와요." />
          ) : (
            onSite.map((event) => <EventRow key={event.id} event={event} isEnded={false} />)
          )}
        </div>
      </section>

      {ended.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>올려 둔 채 끝난 행사</h2>
          <div className={shared.card}>
            {ended.map((event) => (
              <EventRow key={event.id} event={event} isEnded />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
