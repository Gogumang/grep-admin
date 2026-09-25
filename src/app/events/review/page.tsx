import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { EventReviewList } from './EventReviewList'

export const dynamic = 'force-dynamic'

/**
 * 판매처(티켓타코·이벤터스)에서 모은 개발 행사 중 아직 아무도 보지 않은 것. 올린 행사만 행사 일정(사이트 후보)에 실린다.
 * 개발 행사 규칙을 통과한 것만 오지만, 교육 과정·강의 판매가 섞여 올 수 있어 사람이 한 번 본다.
 */
export default async function EventReviewPage() {
  await requireAdmin()

  try {
    const pending = await collector.listPendingEvents()
    return (
      <>
        <h1 className={console.pageTitle}>행사 검증 {pending.length}건</h1>
        <p className={shared.mutedText} style={{ marginBottom: 20 }}>
          올린 행사는 행사 일정에 들어가고, 거기서 이미지를 붙여 이벤트 페이지에 올릴 수 있어요. 치운 행사는 다시 모여도 여기로 오지 않아요.
        </p>
        <EventReviewList events={pending} />
      </>
    )
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>행사 검증</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
