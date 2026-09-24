import { Children, type ReactNode } from 'react'
import { Button, type ButtonColor, type ButtonSize } from './Button'
import * as styles from './Stepper.css'

/**
 * TDS Mobile의 Stepper를 본뜬 단계 목록. 줄들을 감싸 위에서부터 차례로 떠오르게 한다.
 *
 * TDS는 Framer Motion으로 움직이지만 여기서는 CSS 애니메이션으로 그렸다 — 이 저장소에
 * 애니메이션 라이브러리가 없고, 떠오르는 효과 하나에 런타임을 들일 이유가 없다.
 * play를 끄거나 사용자가 움직임 줄이기를 켜면 처음부터 제자리에 있다.
 */
export function Stepper({
  play = true,
  delay = 0,
  staggerDelay = 0.1,
  children,
}: {
  play?: boolean
  /** 첫 줄이 떠오르기까지 기다리는 초. */
  delay?: number
  /** 줄 사이 간격(초). */
  staggerDelay?: number
  children: ReactNode
}) {
  if (!play) return <div>{children}</div>

  return (
    <div>
      {Children.toArray(children).map((child, index) => (
        <div
          // toArray가 붙여 준 key를 그대로 쓴다 — 다시 그려도 이미 떠오른 줄이 다시 움직이지 않는다.
          key={(child as { key?: string }).key ?? index}
          className={styles.animatedRow}
          style={{ animationDelay: `${delay + index * staggerDelay}s` }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

/**
 * 단계 한 줄. 왼쪽(번호·그림) · 가운데(글) · 오른쪽(화살표·버튼) 세 칸이고,
 * 마지막 줄이 아니면 왼쪽 아이콘 아래로 다음 단계까지 선을 긋는다.
 */
export function StepperRow({
  left,
  center,
  right,
  hideLine = false,
}: {
  left: ReactNode
  center: ReactNode
  right?: ReactNode
  /** 마지막 단계에서 켠다. 이어질 단계가 없는데 선이 남으면 목록이 끝나지 않은 것처럼 보인다. */
  hideLine?: boolean
}) {
  return (
    <div className={styles.row}>
      {!hideLine && <span className={styles.line} aria-hidden="true" />}
      <span className={styles.left}>{left}</span>
      {center}
      {right ? <span className={styles.right}>{right}</span> : <span />}
    </div>
  )
}

type TextsType = 'A' | 'B' | 'C'

/** A: 보통 제목·보통 설명 / B: 큰 제목·보통 설명 / C: 보통 제목·작은 설명. */
function StepperTexts({ type, title, description }: { type: TextsType; title: ReactNode; description?: ReactNode }) {
  return (
    <div className={styles.texts}>
      <p className={[styles.titleBase, styles.title[type]].join(' ')}>{title}</p>
      {/* 설명에는 진행 막대처럼 블록 요소가 들어오기도 해서 p가 아니라 div로 감싼다. */}
      {description && <div className={[styles.descriptionBase, styles.description[type]].join(' ')}>{description}</div>}
    </div>
  )
}

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** 1부터 9까지의 번호 원. TDS가 한 자리만 받는 건 24px 원 안에 두 자리가 들어가지 않기 때문이다. */
function StepperNumberIcon({ number }: { number: StepNumber }) {
  return (
    <span className={styles.numberIcon} aria-label={`${number}단계`}>
      {number}
    </span>
  )
}

/**
 * 번호 대신 그림을 넣는 자리. 크기를 번호 원과 같게 잡아 줄들이 어긋나지 않게 한다.
 *
 * TDS는 shape(Asset.frameShape)를 받지만 어드민에는 Asset 컴포넌트가 없어 원형 하나만 둔다.
 */
function StepperAssetFrame({ content, backgroundColor = 'transparent' }: { content: ReactNode; backgroundColor?: string }) {
  return (
    <span className={styles.iconFrame} style={{ backgroundColor }}>
      {content}
    </span>
  )
}

function StepperRightArrow() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" className={styles.arrow}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StepperRightButton({
  size = 'small',
  color = 'primary',
  onClick,
  children,
}: {
  size?: ButtonSize
  color?: ButtonColor
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <Button size={size} color={color} variant="weak" onClick={onClick}>
      {children}
    </Button>
  )
}

StepperRow.Texts = StepperTexts
StepperRow.NumberIcon = StepperNumberIcon
StepperRow.AssetFrame = StepperAssetFrame
StepperRow.RightArrow = StepperRightArrow
StepperRow.RightButton = StepperRightButton
