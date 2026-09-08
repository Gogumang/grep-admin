import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'
import { tone } from '../styles/palette.css'

/** TDS BarChart가 고르는 색. 팔레트에는 teal도 있지만 차트에는 없다. */
export const BAR_THEMES = ['blue', 'green', 'yellow', 'orange', 'red', 'grey', 'default'] as const

export const chart = style({
  display: 'flex',
  // 컬럼이 차트 높이를 그대로 받아야 안쪽 track이 남은 자리를 채운다 (stretch가 기본값).
  // 여기서 flex-end로 묶으면 컬럼이 내용 높이로 줄어 막대가 최소 높이까지 눌린다.
  alignItems: 'stretch',
  gap: vars.space.sm,
  fontFamily: vars.font.sans,
  // 항목이 스무 개 넘게 늘어도 카드 밖으로 삐져나가지 않게 이 안에서만 가로로 넘긴다.
  overflowX: 'auto',
  paddingBottom: vars.space.xs,
})

export const column = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.xs,
  // 항목이 적으면 넓게 퍼지고, 많아지면 56px 에서 멈춘 뒤 가로 스크롤로 넘어간다.
  flex: '1 1 0',
  // 컬럼이 내용 높이 밑으로 줄 수 있어야 track의 flex:1 이 계산된다.
  minHeight: 0,
  minWidth: 56,
  maxWidth: 96,
  padding: `${vars.space.xs} 4px`,
  borderRadius: vars.radius.sm,
  selectors: {
    // 회색 트랙과 구분되도록 옅은 파랑으로 짚는다.
    '&:hover': { background: `color-mix(in srgb, ${vars.color.accent} 7%, transparent)` },
  },
})

export const annotation = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkStrong,
  // 자릿수가 달라도 숫자 폭이 흔들리지 않게.
  fontVariantNumeric: 'tabular-nums',
})

/** 막대가 자라는 자리. 높이는 chart 전체 높이에서 숫자·이름 줄을 뺀 나머지를 받는다. */
export const track = style({
  width: '100%',
  flex: 1,
  minHeight: 0,
  display: 'flex',
  alignItems: 'flex-end',
  borderRadius: 4,
  background: vars.color.surfaceSunken,
})

export const bar = style({
  width: '100%',
  // 바닥선 쪽은 각지게, 값 쪽만 둥글게 — 막대가 어디서 시작하는지 흐려지지 않는다.
  borderRadius: '4px 4px 2px 2px',
  // 값이 아주 작은 막대가 아예 안 보이는 것을 막는다. 숫자가 위에 있어 오해되지 않는다.
  minHeight: 6,
})

export const barTheme = styleVariants({
  blue: { background: tone.blue.fill },
  green: { background: tone.green.fill },
  yellow: { background: tone.yellow.fill },
  orange: { background: tone.orange.fill },
  red: { background: tone.red.fill },
  grey: { background: tone.elephant.fill },
  /** 색을 고르지 않았을 때. 화면의 기본 강조색을 따른다. */
  default: { background: vars.color.accent },
})

export const label = style({
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
