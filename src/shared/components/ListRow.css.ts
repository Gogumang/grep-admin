import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const root = style({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  gap: vars.space.md,
  width: '100%',
  border: 0,
  background: 'transparent',
  fontFamily: vars.font.sans,
  textAlign: 'left',
  textDecoration: 'none',
  color: 'inherit',
  position: 'relative',
  selectors: {
    '&[data-interactive="true"]': { cursor: 'pointer' },
    '&[data-disabled="true"]': { cursor: 'not-allowed' },
  },
})

/**
 * 구분선은 배경이 아니라 가상 요소로 그린다. border-bottom을 쓰면 마지막 줄에도 선이 남고,
 * indented(왼쪽을 띄운 선)를 만들 수 없다.
 */
export const border = styleVariants({
  indented: {
    selectors: {
      '&:not(:last-child)::after': {
        content: '',
        position: 'absolute',
        left: vars.space.lg,
        right: 0,
        bottom: 0,
        height: 1,
        background: vars.color.border,
      },
    },
  },
  none: {},
})

/** TDS 치수 그대로 — small 8px, medium 12px, large 16px, xlarge 24px. */
export const verticalPadding = styleVariants({
  small: { paddingBlock: vars.space.sm },
  medium: { paddingBlock: vars.space.md },
  large: { paddingBlock: 16 },
  xlarge: { paddingBlock: 24 },
})

export const horizontalPadding = styleVariants({
  small: { paddingInline: vars.space.lg },
  medium: { paddingInline: 24 },
})

export const alignment = styleVariants({
  top: { alignSelf: 'start' },
  center: { alignSelf: 'center' },
})

/**
 * 흐리게(type1) / 눌러서 죽이기(type2). TDS가 둘을 나눈 이유는, 목록에서 통째로 못 쓰는 줄과
 * '지금은 못 누르지만 내용은 읽어야 하는' 줄이 다르기 때문이다.
 */
export const disabledStyle = styleVariants({
  type1: { opacity: 0.4 },
  type2: { opacity: 0.6, filter: 'grayscale(1)' },
})

/** TDS의 withTouchEffect 자리. 마우스 화면이라 누름 대신 hover로 옮겼다. */
export const touchEffect = style({
  transition: 'background 120ms ease-out',
  selectors: {
    '&:hover:not([data-disabled="true"])': { background: vars.color.surfaceSunken },
  },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

export const side = style({ display: 'flex', alignItems: 'center' })

export const arrow = style({ color: vars.color.inkFaint, flexShrink: 0 })

export const texts = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
})

export const title = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.inkStrong,
  // 목록에서 제목이 길면 줄을 늘리는 대신 자른다 — 줄마다 높이가 달라지면 훑기 어렵다.
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const description = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.fontSize.xs,
  color: vars.color.inkMuted,
})
