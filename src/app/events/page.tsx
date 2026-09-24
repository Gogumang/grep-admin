import { listSiteEvents, type SiteEvent } from '@/lib/events'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { EventsView } from './EventsView'

export const dynamic = 'force-dynamic'

/** 오늘(서울). 끝난 행사를 가르는 기준이다 — 서버가 UTC로 돌아서 그냥 쓰면 아침 아홉 시 전까지 하루가 밀린다. */
function todayInSeoul(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

/**
 * 티켓타코에서 모은 개발 행사. 목록은 collector가 매일 통째로 다시 쓰고,
 * 이벤트 페이지에 올릴 행사는 여기서 사람이 고른다(자동으로 올라가는 행사는 없다).
 */
export default async function EventsPage() {
  await requireAdmin()

  let events: SiteEvent[]
  try {
    events = await listSiteEvents()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>행사 일정</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  return <EventsView events={events} today={todayInSeoul()} />
}
