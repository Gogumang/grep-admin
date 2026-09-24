import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 단계 목록이 놓이는 카드. 마지막 단계 아래 여백은 Stepper 줄이 이미 갖고 있다. */
export const stepperCard = style({
  padding: `${vars.space.lg} ${vars.space.lg} 0`,
})

export const progressBar = style({
  height: 6,
  borderRadius: vars.radius.full,
  background: vars.color.surfaceSunken,
  overflow: 'hidden',
  margin: `${vars.space.sm} 0`,
})

export const progressFill = style({
  height: '100%',
  background: vars.color.accent,
  transition: 'width 200ms ease-out',
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

export const summary = style({ margin: 0 })

export const failureList = style({
  listStyle: 'none',
  margin: `${vars.space.xs} 0 0`,
  padding: 0,
  fontSize: vars.fontSize.sm,
})

export const failureName = style({ color: vars.color.brand, fontWeight: vars.fontWeight.medium })

/** 체크·✕는 번호 원과 같은 24px 자리에 채워 그린다 — 단계마다 표시 크기가 다르면 선이 어긋나 보인다. */
const mark = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
})

export const markDone = style([mark, { background: vars.color.accent, color: vars.color.onAccent }])
export const markFailed = style([mark, { background: vars.color.brand, color: vars.color.onAccent }])
