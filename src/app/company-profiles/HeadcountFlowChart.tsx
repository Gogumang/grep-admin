'use client'

import { useState } from 'react'
import { formatCount, formatShortMonth, type CompanyProfile } from '@/lib/companyProfiles'
import * as shared from '@/components/shared.css'
import * as styles from './companyProfiles.css'

/** 꺾은선이 차지하는 높이(px). 첫·마지막 달 숫자가 점 위에 얹힐 자리까지 포함한다. */
const LINE_HEIGHT = 150
/** 꺾은선이 위아래 끝에 붙지 않게 남기는 여백(%). 위는 숫자 자리라 더 넓다. */
const LINE_TOP_PADDING = 22
const LINE_BOTTOM_PADDING = 8
/** 입사·퇴사 막대가 자라는 높이(px). */
const BAR_HEIGHT = 110

/** 끝 칸에서는 상자를 안쪽으로 민다 — 가운데 맞춤이면 카드 밖으로 잘린다. */
function tooltipShift(index: number, count: number): string {
  if (index < 2) return '-20%'
  if (index >= count - 2) return '-80%'
  return '-50%'
}

/**
 * 월별 직원 수(꺾은선)와 입사·퇴사(파랑·빨강 막대)를 한 카드에, 같은 달 칸으로 맞춰 그린다.
 *
 * 한 축에 겹치지 않는다 — 직원 수는 천 명대, 입사·퇴사는 수십 명이라 같은 눈금이면 막대가 바닥에 붙는다.
 * 그래서 선은 위, 막대는 아래에 각자 눈금으로 두고 달 칸만 공유한다(축 두 개 겹치기 금지).
 * 선은 변화를 보는 것이라 0 에서 시작하지 않고 가장 적은 달~가장 많은 달로 잡는다. 막대는 0 에서 시작한다.
 * 숫자는 직원 수 첫·마지막 달에만 얹고, 달마다 정확한 값은 칸에 마우스를 올리면 뜨는 상자나 아래 표에서 본다.
 */
export function HeadcountFlowChart({ profile }: { profile: CompanyProfile }) {
  const months = profile.headcounts
  const count = months.length
  const employees = months.map((month) => month.employeeCount)
  const lowest = Math.min(...employees)
  // 모든 달이 같아도 나누지 않도록 1 로 받친다.
  const range = Math.max(1, Math.max(...employees) - lowest)
  const usable = 100 - LINE_TOP_PADDING - LINE_BOTTOM_PADDING
  const lineY = (employeeCount: number) => LINE_TOP_PADDING + (1 - (employeeCount - lowest) / range) * usable
  const columnCenter = (index: number) => ((index + 0.5) / count) * 100
  const largestFlow = Math.max(1, ...months.flatMap((month) => [month.hiredCount, month.leftCount]))
  const last = count - 1
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const hovered = hoveredIndex === null ? null : months[hoveredIndex]

  return (
    <figure className={`${shared.card} ${styles.flowFigure}`}>
      <figcaption className={styles.flowLegend}>
        <span className={styles.flowLegendItem}>
          <span className={styles.lineSwatch} aria-hidden="true" />
          전체 직원
        </span>
        <span className={styles.flowLegendItem}>
          <span className={styles.hiredSwatch} aria-hidden="true" />
          입사
        </span>
        <span className={styles.flowLegendItem}>
          <span className={styles.leftSwatch} aria-hidden="true" />
          퇴사
        </span>
      </figcaption>

      <div className={styles.flowChart}>
        <div className={styles.flowLineLayer} style={{ height: LINE_HEIGHT }} aria-hidden="true">
          <svg className={styles.flowLineSvg} viewBox={`0 0 ${count} 100`} preserveAspectRatio="none">
            <polyline
              className={styles.flowLine}
              vectorEffect="non-scaling-stroke"
              points={months.map((month, index) => `${index + 0.5},${lineY(month.employeeCount)}`).join(' ')}
            />
          </svg>
          {months.map((month, index) => (
            <span key={month.yearMonth} style={{ position: 'absolute', left: `${columnCenter(index)}%`, top: `${lineY(month.employeeCount)}%` }}>
              <span className={styles.flowDot} />
              {(index === 0 || index === last) && <span className={styles.flowDotLabel}>{formatCount(month.employeeCount)}</span>}
            </span>
          ))}
        </div>

        {hovered && hoveredIndex !== null && (
          <div
            className={styles.flowTooltip}
            style={{ left: `${columnCenter(hoveredIndex)}%`, transform: `translateX(${tooltipShift(hoveredIndex, count)})` }}
            role="status"
          >
            <div className={styles.flowTooltipMonth}>{hovered.yearMonth}</div>
            <div className={styles.flowTooltipRow}>
              <span className={styles.lineSwatch} aria-hidden="true" />
              직원 <strong>{formatCount(hovered.employeeCount)}명</strong>
            </div>
            <div className={styles.flowTooltipRow}>
              <span className={styles.hiredSwatch} aria-hidden="true" />
              입사 <strong>{formatCount(hovered.hiredCount)}명</strong>
            </div>
            <div className={styles.flowTooltipRow}>
              <span className={styles.leftSwatch} aria-hidden="true" />
              퇴사 <strong>{formatCount(hovered.leftCount)}명</strong>
            </div>
          </div>
        )}

        <div className={styles.flowColumns} onMouseLeave={() => setHoveredIndex(null)}>
          {months.map((month, index) => (
            <div
              key={month.yearMonth}
              className={index === hoveredIndex ? `${styles.flowColumn} ${styles.flowColumnActive}` : styles.flowColumn}
              onMouseEnter={() => setHoveredIndex(index)}
              aria-label={`${month.yearMonth} 직원 ${formatCount(month.employeeCount)}명, 입사 ${formatCount(month.hiredCount)}명, 퇴사 ${formatCount(month.leftCount)}명`}
            >
              <div style={{ height: LINE_HEIGHT }} />
              <div className={styles.flowBarTrack} style={{ height: BAR_HEIGHT }} aria-hidden="true">
                <span className={styles.hiredBar} style={{ height: `${(month.hiredCount / largestFlow) * 100}%` }} />
                <span className={styles.leftBar} style={{ height: `${(month.leftCount / largestFlow) * 100}%` }} />
              </div>
              <span className={styles.flowMonth}>{formatShortMonth(month.yearMonth)}</span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}
