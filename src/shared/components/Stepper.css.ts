import { keyframes, style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 왼쪽 아이콘 한 변. TDS의 NumberIcon·AssetFrame(CircleMedium) 크기다. */
const ICON_SIZE = 24

const enter = keyframes({
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'none' },
})

/** Stepper가 감싼 줄. 순서대로 떠오르게 하는 지연은 줄마다 style로 넘긴다. */
export const animatedRow = style({
  animation: `${enter} 400ms ease-out both`,
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
})

export const row = style({
  display: 'grid',
  gridTemplateColumns: `${ICON_SIZE}px minmax(0, 1fr) auto`,
  columnGap: vars.space.md,
  position: 'relative',
  // 아래 여백은 다음 단계까지 이어지는 선이 지나갈 자리다.
  paddingBottom: vars.space.lg,
  fontFamily: vars.font.sans,
})

/**
 * 다음 단계로 잇는 세로선. 아이콘 아래에서 시작해 줄 끝까지 긋는다 —
 * 설명이 길어져 줄이 늘어나도 선이 따라 늘어난다.
 */
export const line = style({
  position: 'absolute',
  left: ICON_SIZE / 2 - 1,
  top: ICON_SIZE + 4,
  bottom: 4,
  width: 2,
  borderRadius: 1,
  background: vars.color.border,
})

export const left = style({ display: 'flex', justifyContent: 'center' })
export const right = style({ display: 'flex', alignItems: 'flex-start' })

export const iconFrame = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: ICON_SIZE,
  height: ICON_SIZE,
  borderRadius: vars.radius.full,
  overflow: 'hidden',
  flexShrink: 0,
})

export const numberIcon = style([
  iconFrame,
  {
    background: vars.color.accentSoft,
    color: vars.color.accent,
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.bold,
    fontVariantNumeric: 'tabular-nums',
  },
])

export const texts = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
  // 제목 첫 줄이 24px 아이콘의 가운데에 오게 맞춘다.
  paddingTop: 1,
})

/** TDS 타이포 t4 20px · t5 17px · t6 15px · t7 13px 를 토큰 xl · lg · md · sm 에 맞췄다. */
export const title = styleVariants({
  A: { fontSize: vars.fontSize.lg },
  B: { fontSize: vars.fontSize.xl },
  C: { fontSize: vars.fontSize.lg },
})

export const titleBase = style({
  margin: 0,
  lineHeight: 1.35,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkStrong,
})

export const description = styleVariants({
  A: { fontSize: vars.fontSize.md },
  B: { fontSize: vars.fontSize.md },
  C: { fontSize: vars.fontSize.sm },
})

export const descriptionBase = style({
  margin: 0,
  lineHeight: 1.5,
  color: vars.color.inkMuted,
})

export const arrow = style({ color: vars.color.borderStrong, marginTop: 2 })
