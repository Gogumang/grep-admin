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

/** 끝남·실패 표시. 오른쪽 칸 글자 한 줄 높이에 맞춘 원이다. */
const mark = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: vars.radius.full,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.onAccent,
})

export const markDone = style([mark, { background: vars.color.accent }])
export const markFailed = style([mark, { background: vars.color.brand }])

/** 저장 줄 그림. 번호 원과 같은 색으로 채워 블로그 아이콘들과 구분한다. */
export const saveIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  background: vars.color.accentSoft,
  color: vars.color.accent,
})
