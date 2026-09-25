import type { ClubRecruitments } from '@/lib/collector'
import { Badge } from '@/shared'
import * as styles from './clubs.css'

const timeFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

/**
 * 자동으로 읽는 동아리의 수집 상태 — 마지막으로 읽은 시각과 성공 여부만. 모집 날짜는 수집처 화면의 관심사가 아니다.
 * 일정을 공개하지 않은 것(모집 기간 아님)은 실패가 아니라 정상이다.
 */
export function CollectStatus({ collected }: { collected: ClubRecruitments | undefined }) {
  const check = collected?.check
  if (!check) {
    return (
      <Badge color="elephant" variant="weak" size="xsmall">
        아직 읽지 않음
      </Badge>
    )
  }
  return (
    <>
      <Badge color={check.isOk ? 'green' : 'red'} variant="weak" size="xsmall">
        {check.isOk ? '정상' : '실패'}
      </Badge>
      <span className={styles.note}>
        {timeFormat.format(new Date(check.checkedAt))} 확인{check.isOk ? '' : ` — ${check.message}`}
      </span>
    </>
  )
}
