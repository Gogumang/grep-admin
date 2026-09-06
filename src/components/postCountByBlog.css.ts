import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/**
 * 회사별 글 수 세로 막대. 한 가지 값(글 수)만 보여주므로 색은 한 가지다 —
 * 회사마다 다른 색을 주면 색이 순위를 따라다니게 되고, 회사가 늘 때마다 색이 뒤바뀐다.
 */

/** 막대가 자라는 높이. 값이 아니라 자리 크기라서 토큰이 아니라 여기 상수로 둔다. */
const PLOT_HEIGHT = 168

export const chart = style({
  display: 'flex',
  // 막대는 바닥선에서 자란다.
  alignItems: 'flex-end',
  gap: vars.space.sm,
  // 회사가 스무 곳 넘게 늘어도 카드 밖으로 삐져나가지 않게 이 안에서만 가로로 넘긴다.
  overflowX: 'auto',
  paddingBottom: vars.space.xs,
})

export const column = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.xs,
  // 회사가 적으면 넓게 퍼지고, 많아지면 56px 에서 멈춘 뒤 가로 스크롤로 넘어간다.
  flex: '1 1 0',
  minWidth: 56,
  maxWidth: 96,
  padding: `${vars.space.xs} 4px`,
  borderRadius: vars.radius.sm,
  selectors: {
    // 회색 트랙과 구분되도록 옅은 파랑으로 짚는다.
    '&:hover': { background: `color-mix(in srgb, ${vars.color.accent} 7%, transparent)` },
  },
})

export const count = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkStrong,
  // 자릿수가 달라도 숫자 폭이 흔들리지 않게.
  fontVariantNumeric: 'tabular-nums',
})

export const track = style({
  width: '100%',
  height: PLOT_HEIGHT,
  display: 'flex',
  alignItems: 'flex-end',
  borderRadius: 4,
  background: vars.color.surfaceSunken,
})

export const bar = style({
  width: '100%',
  // 바닥선 쪽은 각지게, 값 쪽만 둥글게 — 막대가 어디서 시작하는지 흐려지지 않는다.
  borderRadius: '4px 4px 2px 2px',
  background: vars.color.accent,
  // 1개짜리 회사의 막대가 아예 안 보이는 것을 막는다. 숫자가 위에 있어 오해되지 않는다.
  minHeight: 6,
})

export const name = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.inkMuted,
  textAlign: 'center',
  lineHeight: 1.3,
  // "카카오엔터프라이즈" 같은 긴 이름을 두 줄까지 풀어 준다. 그보다 길면 잘리고,
  // 잘린 이름은 막대에 걸린 title 로 확인할 수 있다.
  wordBreak: 'keep-all',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
})
