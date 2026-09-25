import type { ClubRecruitments } from '@/lib/collector'
import { Badge } from '@/shared'
import * as shared from '@/components/shared.css'
import { AcknowledgePageChangeButton } from './AcknowledgePageChangeButton'
import * as styles from './clubs.css'

const checkedFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/**
 * 곳 하나를 collector 가 마지막으로 본 결과. 자동으로 읽는 곳은 모집 일정 수집(check), 사람이 적는 곳은 모집 페이지 변화(pageCheck)다.
 * 페이지가 바뀐 뒤 아무도 확인하지 않았으면 배지와 '확인했어요'를 둔다 — 사람이 페이지를 열어 날짜를 다시 맞추라는 뜻이다.
 */
export function ClubCheckCell({ status }: { status: ClubRecruitments | undefined }) {
  const check = status?.check ?? status?.pageCheck
  if (!status || !check) return <span className={shared.mutedText}>—</span>

  const pageCheck = status.pageCheck
  return (
    <span className={styles.checkCell}>
      <span className={shared.mutedText} title={check.message ?? undefined}>
        {checkedFormat.format(new Date(check.checkedAt))}
        {!check.isOk && <span className={styles.checkFailed}> · 실패</span>}
      </span>
      {pageCheck?.hasUnacknowledgedChange && pageCheck.changedAt && (
        <span className={styles.checkChanged}>
          <Badge color="yellow" variant="weak" size="xsmall" title={`${checkedFormat.format(new Date(pageCheck.changedAt))}에 바뀜`}>
            변경됨 — 날짜를 다시 확인하세요
          </Badge>
          <AcknowledgePageChangeButton clubKey={status.clubKey} />
        </span>
      )}
    </span>
  )
}
