import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'
import { tone } from '../styles/palette.css'

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
  fontFamily: vars.font.sans,
})

/** 라벨·입력·오른쪽 요소가 한 상자 안에 앉는다. 테두리는 variant가 정한다. */
export const field = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  background: vars.color.surface,
  transition: 'border-color 120ms ease-out',
  selectors: {
    '&[data-disabled="true"]': { background: vars.color.surfaceSunken, cursor: 'not-allowed' },
  },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

export const variant = styleVariants({
  box: {
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    padding: `0 ${vars.space.md}`,
    minHeight: 48,
    selectors: { '&[data-focused="true"]': { borderColor: vars.color.accent } },
  },
  line: {
    borderBottom: `1px solid ${vars.color.border}`,
    padding: `0 0 ${vars.space.sm}`,
    background: 'transparent',
    selectors: { '&[data-focused="true"]': { borderBottomColor: vars.color.accent } },
  },
  // big·hero는 금액 입력처럼 값 자체가 화면의 주인공인 자리다. 상자를 없애고 글자만 키운다.
  big: { border: 0, background: 'transparent', padding: 0 },
  hero: { border: 0, background: 'transparent', padding: 0 },
})

export const hasError = style({
  selectors: {
    '&&': { borderColor: tone.red.fill },
    '&&[data-focused="true"]': { borderColor: tone.red.fill },
  },
})

export const inputSize = styleVariants({
  box: { fontSize: vars.fontSize.md },
  line: { fontSize: vars.fontSize.md },
  big: { fontSize: vars.fontSize.xl, fontWeight: vars.fontWeight.bold },
  hero: { fontSize: vars.fontSize.xxl, fontWeight: vars.fontWeight.bold },
})

export const input = style({
  flex: 1,
  minWidth: 0,
  border: 0,
  outline: 'none',
  background: 'transparent',
  color: vars.color.inkStrong,
  fontFamily: 'inherit',
  padding: `${vars.space.md} 0`,
  selectors: {
    '&::placeholder': { color: vars.color.inkFaint },
    '&:disabled': { color: vars.color.inkFaint, cursor: 'not-allowed' },
  },
})

/** 여러 줄 입력. 세로로 자라되 상자 밖으로 넘치지 않게 스크롤은 제 안에서 맡는다. */
export const textarea = style([
  input,
  {
    resize: 'vertical',
    minHeight: 120,
    lineHeight: 1.6,
    overflowY: 'auto',
  },
])

export const label = style({
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.inkMuted,
})

/**
 * labelOption="appear"의 라벨. 값이 없을 때는 placeholder가 라벨 노릇을 하므로 감춘다.
 * display:none 대신 자리를 비워 두면 값이 들어오는 순간 줄이 밀려 화면이 덜컥인다 —
 * 높이는 유지하고 투명도만 바꾼다.
 */
export const labelAppear = style([
  label,
  {
    visibility: 'hidden',
    selectors: { '&[data-visible="true"]': { visibility: 'visible' } },
  },
])

export const affix = style({
  color: vars.color.inkMuted,
  fontSize: vars.fontSize.sm,
  whiteSpace: 'nowrap',
})

export const help = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.inkMuted,
})

export const helpError = style([help, { color: tone.red.onWeak }])

/** 오른쪽에 붙는 지우기·보기 단추. 입력 높이를 늘리지 않도록 상자 크기를 고정한다. */
export const rightButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  border: 0,
  padding: 0,
  borderRadius: vars.radius.full,
  background: vars.color.surfaceSunken,
  color: vars.color.inkMuted,
  fontSize: vars.fontSize.xs,
  cursor: 'pointer',
  selectors: { '&:hover': { color: vars.color.inkStrong } },
})
