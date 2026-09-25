import type { ClubRecruitments } from '@/lib/collector'
import { Badge } from '@/shared'
import * as styles from './clubs.css'

const dateFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric' })
const timeFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

/**
 * 자동으로 읽는 동아리의 가장 최근 모집과 상태. 상태는 지금 시각과 접수 기간으로 가른다 —
 * 사이트의 '모집 중' 문구를 믿지 않는다(비모집 때 오늘 날짜를 채워 보여 주는 사이트가 있다).
 */
export function RecruitmentStatus({ collected, now }: { collected: ClubRecruitments | undefined; now: Date }) {
  const latest = collected?.recruitments[0]
  const check = collected?.check

  return (
    <>
      {latest ? (
        <>
          {latest.title} · {dateFormat.format(new Date(latest.applyStartAt))} ~ {dateFormat.format(new Date(latest.applyEndAt))}{' '}
          <StateBadge start={new Date(latest.applyStartAt)} end={new Date(latest.applyEndAt)} now={now} />
        </>
      ) : (
        <Badge color="elephant" variant="weak" size="xsmall">
          아직 가져온 일정 없음
        </Badge>
      )}
      {check && (
        <span className={styles.note}>
          {timeFormat.format(new Date(check.checkedAt))} 확인 · {check.isOk ? (check.message ?? `일정 ${check.foundCount}건`) : `실패 — ${check.message}`}
        </span>
      )}
    </>
  )
}

function StateBadge({ start, end, now }: { start: Date; end: Date; now: Date }) {
  if (now < start) {
    return (
      <Badge color="blue" variant="weak" size="xsmall">
        모집 예정
      </Badge>
    )
  }
  if (now <= end) {
    return (
      <Badge color="green" variant="fill" size="xsmall">
        모집 중
      </Badge>
    )
  }
  return (
    <Badge color="elephant" variant="weak" size="xsmall">
      마감
    </Badge>
  )
}
