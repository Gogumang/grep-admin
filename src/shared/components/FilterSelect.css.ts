import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/**
 * 트리거와 팝오버를 한 덩어리로 묶는다 — 팝오버를 트리거 바로 아래에 붙이는 기준점이다.
 * flex 부모 안에서 세로로 늘어나면 top: 100%가 부모 바닥을 가리켜 팝오버가 멀리 떨어진다. 그래서 늘어나지 않게 막는다.
 */
export const root = style({ position: 'relative', display: 'inline-flex', alignSelf: 'flex-start' })

/**
 * 필터 칩. 토스증권 스크리너 필터 칩의 치수(높이 28, 글자 13/600, 모서리 7)를 따랐다.
 * 값을 고르면 파랗게 바뀐다 — 목록이 좁혀져 있다는 걸 칩만 보고 알아야 한다.
 */
export const trigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  height: 28,
  padding: `0 6px 0 ${vars.space.sm}`,
  border: 'none',
  borderRadius: 7,
  background: vars.color.surfaceSunken,
  color: vars.color.ink,
  fontFamily: 'inherit',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: '20px',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transition: 'background 120ms ease-out',
  selectors: {
    '&:hover': { background: vars.color.border },
    '&:focus-visible': { outline: `2px solid ${vars.color.accent}`, outlineOffset: 2 },
    '&[data-active="true"]': { background: vars.color.accentSoft, color: vars.color.accent },
  },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

export const chevron = style({
  flexShrink: 0,
  transition: 'transform 160ms ease-out',
  selectors: { '[aria-expanded="true"] > &': { transform: 'rotate(180deg)' } },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

export const popover = style({
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: 0,
  zIndex: 900,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 200,
  maxWidth: 'calc(100vw - 32px)',
  padding: vars.space.sm,
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.04)',
})

/** 회사가 스무 곳을 넘어도 팝오버가 화면 밖으로 밀리지 않게 목록만 스크롤한다. */
export const list = style({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 360,
  margin: 0,
  padding: 0,
  overflowY: 'auto',
  listStyle: 'none',
  outline: 'none',
})

export const option = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  flexShrink: 0,
  minHeight: 40,
  padding: `0 ${vars.space.sm}`,
  borderRadius: vars.radius.md,
  color: vars.color.inkSubtle,
  fontSize: vars.fontSize.md,
  cursor: 'pointer',
  userSelect: 'none',
  selectors: {
    '&[data-highlighted="true"]': { background: vars.color.surfaceSunken },
    '&[aria-selected="true"]': {
      background: vars.color.surfaceSunken,
      color: vars.color.accent,
      fontWeight: vars.fontWeight.semibold,
    },
  },
})

export const optionLabel = style({
  flex: 1,
  minWidth: 0,
  paddingRight: vars.space.sm,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

/** 체크 자리는 고르지 않은 줄에도 비워 둔다 — 고를 때마다 글자 폭이 흔들리지 않게. */
export const check = style({ flexShrink: 0, width: 16, height: 16, color: vars.color.accent })
