import { collector } from '@/lib/collector'
import { listSiteEvents } from '@/lib/events'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { EventsView } from './EventsView'

export const dynamic = 'force-dynamic'

/** 갱신 버튼(서버 액션)이 판매처를 다 읽을 때까지 기다린다. 기본 제한 시간으로는 중간에 끊긴다. */
export const maxDuration = 120

/** 오늘(서울). 끝난 행사를 가르는 기준이다 — 서버가 UTC로 돌아서 그냥 쓰면 아침 아홉 시 전까지 하루가 밀린다. */
function todayInSeoul(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

/**
 * 판매처(티켓타코·이벤터스)에서 모은 개발 행사를 한 화면에서 다룬다.
 *   새로 모은 행사(검증 대기) → 올리면 사이트 후보('올리지 않은 행사') → 이미지를 붙여 올리면 이벤트 페이지
 * 자동으로 올라가는 단계는 없다.
 */
export default async function EventsPage() {
  await requireAdmin()

  // 새로 모은 행사는 보조다 — collector 가 잠깐 안 되면 그 영역만 알리고 나머지 화면은 그린다.
  const [siteEvents, pending] = await Promise.allSettled([listSiteEvents(), collector.listPendingEvents()])
  if (siteEvents.status === 'rejected') {
    const error = siteEvents.reason
    return (
      <>
        <h1 className={console.pageTitle}>행사 일정</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  return (
    <EventsView
      events={siteEvents.value}
      pending={pending.status === 'fulfilled' ? pending.value : []}
      pendingError={pending.status === 'rejected' ? (pending.reason as Error).message : null}
      today={todayInSeoul()}
    />
  )
}
