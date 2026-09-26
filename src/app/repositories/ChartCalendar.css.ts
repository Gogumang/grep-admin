import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const calendar = style({ padding: vars.space.lg })

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.space.sm,
})

export const monthLabel = style({ fontSize: vars.fontSize.md, fontWeight: vars.fontWeight.bold, color: vars.color.inkStrong })

export const navigation = style({
  width: 32,
  height: 32,
  border: 0,
  borderRadius: vars.radius.full,
  background: 'transparent',
  color: vars.color.ink,
  fontSize: vars.fontSize.lg,
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': { background: vars.color.surfaceSunken },
    '&:disabled': { color: vars.color.inkFaint, cursor: 'default' },
  },
})

export const grid = style({ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 })

export const weekday = style({
  textAlign: 'center',
  fontSize: vars.fontSize.xs,
  color: vars.color.inkFaint,
  padding: `${vars.space.xs} 0`,
})

export const day = style({
  position: 'relative',
  height: 36,
  border: 0,
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: vars.fontSize.sm,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.ink,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  selectors: {
    '&:hover:not(:disabled)': { background: vars.color.surfaceSunken },
    '&:disabled': { color: vars.color.inkFaint, cursor: 'default' },
  },
})

/** 차트가 있는 날 아래 작은 점. 점만이 아니라 버튼이 눌리는지(disabled)로도 구분된다. */
export const hasChart = style({
  selectors: {
    '&::after': {
      content: '',
      position: 'absolute',
      left: '50%',
      bottom: 4,
      width: 4,
      height: 4,
      marginLeft: -2,
      borderRadius: vars.radius.full,
      background: vars.color.accent,
    },
  },
})

export const selected = style({
  background: vars.color.accent,
  color: vars.color.onAccent,
  fontWeight: vars.fontWeight.bold,
  selectors: {
    '&:hover:not(:disabled)': { background: vars.color.accentHover },
    '&::after': { background: vars.color.onAccent },
  },
})

/**
 * 주간·월간은 고른 날들이 줄마다 한 띠로 이어져 보이게 모서리를 없앤다 — 월요일·일요일만 둥글게.
 * 요일 머리 일곱 칸이 먼저 오므로 칸 순서의 7n+1 이 월요일, 7n 이 일요일이다.
 */
export const selectedRange = style({
  background: vars.color.accentSoft,
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.bold,
  borderRadius: 0,
  selectors: {
    '&:hover:not(:disabled)': { background: vars.color.accentSoft },
    '&:nth-child(7n + 1)': { borderRadius: `${vars.radius.md} 0 0 ${vars.radius.md}` },
    '&:nth-child(7n)': { borderRadius: `0 ${vars.radius.md} ${vars.radius.md} 0` },
  },
})

/**
 * 한 달은 줄 중간에서 시작하고 끝나기도 한다 — 범위의 첫날·말일도 둥글게.
 * :nth-child(n) 은 모든 칸에 맞는 빈 조건으로, 위 월요일·일요일 규칙과 우선순위를 맞춰 뒤에 오는 이 규칙이 이기게 한다.
 */
export const rangeStart = style({
  selectors: { '&:nth-child(n)': { borderTopLeftRadius: vars.radius.md, borderBottomLeftRadius: vars.radius.md } },
})

export const rangeEnd = style({
  selectors: { '&:nth-child(n)': { borderTopRightRadius: vars.radius.md, borderBottomRightRadius: vars.radius.md } },
})

export const hint = style({ margin: `${vars.space.md} 0 0`, fontSize: vars.fontSize.xs, color: vars.color.inkFaint })

export const latestLink = style({
  border: 0,
  padding: 0,
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  color: vars.color.accent,
  cursor: 'pointer',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})
