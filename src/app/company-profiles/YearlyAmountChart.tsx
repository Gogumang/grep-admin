import { formatWon, UNVERIFIED } from '@/lib/companyProfiles'
import * as shared from '@/components/shared.css'
import * as styles from './companyProfiles.css'

export interface YearlyAmount {
  fiscalYear: number
  /** 원 단위. 없으면 null — 막대 대신 "확인 안 됨"을 둔다. */
  amount: number | null
}

/** 값을 얻지 못한 칸. 이유는 마우스를 올려 본다. 0 과 헷갈리지 않게 늘 같은 글자로 쓴다. */
export function Unverified({ reason }: { reason: string }) {
  return (
    <span className={styles.unverified} title={reason}>
      {UNVERIFIED}
    </span>
  )
}

/**
 * 한 항목(매출·영업이익·순이익)의 연도별 막대. 적자는 0 선 아래로 내려간다 — 공용 BarChart 는 음수를 그리지 못한다.
 *
 * 0 선은 가장 큰 흑자와 가장 큰 적자의 비율로 놓는다. 흑자만 있으면 바닥, 적자만 있으면 천장이다.
 * 금액은 막대 아래에 해마다 적는다 — 해가 여섯 개뿐이라 겹치지 않고, 눈금을 세지 않아도 된다.
 */
export function YearlyAmountChart({ title, points }: { title: string; points: YearlyAmount[] }) {
  const amounts = points.flatMap((point) => (point.amount === null ? [] : [point.amount]))
  const largestGain = Math.max(0, ...amounts)
  const largestLoss = Math.max(0, ...amounts.map((amount) => -amount))
  // 모두 0 이어도 나누지 않도록 1 로 받친다.
  const span = Math.max(1, largestGain + largestLoss)
  const zeroFromTop = (largestGain / span) * 100

  return (
    <figure className={shared.card} style={{ margin: 0 }}>
      <figcaption className={styles.chartTitle}>{title}</figcaption>
      <div className={styles.yearlyChart}>
        {points.map(({ fiscalYear, amount }) => (
          <div
            key={fiscalYear}
            className={styles.yearColumn}
            title={`${fiscalYear}년 ${title} ${amount === null ? UNVERIFIED : formatWon(amount)}`}
          >
            <div className={styles.yearTrack} aria-hidden="true">
              {amount === null ? (
                <span className={styles.trackNotice}>{UNVERIFIED}</span>
              ) : (
                <>
                  <span className={styles.zeroLine} style={{ top: `${zeroFromTop}%` }} />
                  {amount >= 0 ? (
                    <span
                      className={styles.gainBar}
                      style={{ bottom: `${100 - zeroFromTop}%`, height: `${(amount / span) * 100}%` }}
                    />
                  ) : (
                    <span className={styles.lossBar} style={{ top: `${zeroFromTop}%`, height: `${(-amount / span) * 100}%` }} />
                  )}
                </>
              )}
            </div>
            <span className={amount !== null && amount < 0 ? `${styles.yearValue} ${styles.loss}` : styles.yearValue}>
              {amount === null ? '—' : formatWon(amount)}
            </span>
            <span className={styles.yearLabel}>{fiscalYear}</span>
          </div>
        ))}
      </div>
    </figure>
  )
}
