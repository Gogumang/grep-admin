import { createVar, style } from '@vanilla-extract/css'
import { tone } from '@/shared/styles/palette.css'
import { vars } from '@/styles/contract.css'

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.space.md,
  marginBottom: vars.space.lg,
})

export const titleRowTitle = style({ margin: 0 })

export const pushRight = style({ marginLeft: 'auto' })

export const lead = style({ margin: `0 0 ${vars.space.lg}`, fontSize: vars.fontSize.sm, color: vars.color.inkMuted })

export const sectionTitle = style({
  margin: `${vars.space.xl} 0 ${vars.space.sm}`,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkStrong,
})

/** 회사 목록의 로고 + 이름(아래 법인명). */
export const companyNameCell = style({ display: 'flex', alignItems: 'center', gap: vars.space.sm })

/**
 * 표가 좁은 화면에서 넘치면 카드 안에서만 옆으로 민다 — 페이지 전체가 가로로 밀리지 않게.
 * flexShrink 0: 본문(main)이 높이가 정해진 세로 flex 라, overflow 가 있는 카드는 최소 높이가 0 이 되어
 * 줄어든다 — 월별 입사·퇴사 표가 머리줄(48px)만 남고 잘렸다.
 */
export const tableScroller = style({ overflowX: 'auto', flexShrink: 0 })

export const companyLink = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
  selectors: { '&:hover': { color: vars.color.accent } },
})

export const numberCell = style({ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textAlign: 'right' })

export const numberHead = style({ textAlign: 'right' })

/** 적자. 국내 금융 화면처럼 손실을 파랑으로 두지 않는다 — 이 화면의 파랑(accent)은 링크다. 색만으로 말하지 않게 '-' 부호가 함께 붙는다. */
export const loss = style({ color: `color-mix(in oklab, ${vars.color.brand} 80%, ${vars.color.inkStrong})` })

export const hint = style({ fontSize: vars.fontSize.xs, color: vars.color.inkFaint })

export const backLink = style({
  display: 'inline-block',
  marginBottom: vars.space.sm,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  selectors: { '&:hover': { color: vars.color.accent } },
})

/** 기업개황. 이름표와 값을 두 칸으로 — 좁으면 한 칸으로 접힌다. */
export const overviewList = style({
  display: 'grid',
  gridTemplateColumns: 'max-content minmax(0, 1fr)',
  columnGap: vars.space.lg,
  rowGap: vars.space.sm,
  margin: 0,
  fontSize: vars.fontSize.sm,
  '@media': { '(max-width: 560px)': { gridTemplateColumns: 'minmax(0, 1fr)', rowGap: 2 } },
})

export const overviewLabel = style({ color: vars.color.inkMuted })

export const overviewValue = style({ margin: 0, color: vars.color.ink, overflowWrap: 'anywhere' })

export const fieldGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: vars.space.md,
  marginBottom: vars.space.md,
})

export const field = style({ display: 'flex', flexDirection: 'column', gap: vars.space.xs, minWidth: 0 })

export const fieldLabel = style({ fontSize: vars.fontSize.xs, color: vars.color.inkMuted })

export const buttonRow = style({ display: 'flex', flexWrap: 'wrap', gap: vars.space.sm, alignItems: 'center' })

/** 얻지 못한 값. 흐린 글자에 점선 밑줄 — 마우스를 올리면 이유(title)가 나온다는 표시다. */
export const unverified = style({
  color: vars.color.inkFaint,
  textDecoration: 'underline dotted',
  textUnderlineOffset: 3,
  cursor: 'help',
})

/** 섹션 전체가 비었을 때. 이유를 한 줄로 함께 둔다. */
export const unverifiedNotice = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space.sm,
  flexWrap: 'wrap',
  margin: 0,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

export const unverifiedTag = style({
  flexShrink: 0,
  padding: `1px ${vars.space.sm}`,
  borderRadius: vars.radius.full,
  background: vars.color.surfaceSunken,
  color: vars.color.inkStrong,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
})

/* ── 검색 ─────────────────────────────────────────── */

export const searchInput = style({ width: '100%', maxWidth: 480, fontSize: vars.fontSize.md, padding: `10px ${vars.space.md}` })

export const resultList = style({ display: 'grid', gap: vars.space.sm, margin: `${vars.space.lg} 0 0`, padding: 0, listStyle: 'none' })

export const resultItem = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: vars.space.md,
  textDecoration: 'none',
  color: vars.color.ink,
  selectors: { '&:hover': { borderColor: vars.color.accent } },
})

export const resultName = style({ fontSize: vars.fontSize.md, fontWeight: vars.fontWeight.semibold, color: vars.color.inkStrong })

export const resultFacts = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: `2px ${vars.space.lg}`,
  fontSize: vars.fontSize.sm,
  fontVariantNumeric: 'tabular-nums',
})

export const factLabel = style({ color: vars.color.inkMuted, marginRight: vars.space.xs })

/* ── 연도별 손익 그래프 ──────────────────────────────── */

/**
 * 손실 막대 색. 다크의 공용 빨강(#ff6b78)은 차트 명도 띠를 넘어(검사기 FAIL) 한 단 낮춘 값을 쓴다.
 * 라이트는 공용 빨강 그대로다. 파랑·빨강 쌍은 색각 이상 구분(ΔE 19.6 이상)을 통과했고, 부호 '-' 가 함께 붙는다.
 */
const lossFill = createVar()
const gainFill = createVar()

/** 매출·영업이익·순이익을 나란히 — 축을 하나에 겹치지 않고 그래프마다 제 눈금을 쓴다. 좁으면 세로로 쌓는다. */
export const chartGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: vars.space.md,
})

export const chartTitle = style({ margin: `0 0 ${vars.space.sm}`, fontSize: vars.fontSize.sm, fontWeight: vars.fontWeight.semibold, color: vars.color.inkStrong })

/** 파랑(흑자·입사)·빨강(적자·퇴사) 한 쌍. 손익 그래프와 직원 수 그래프가 같이 쓴다. */
const gainLossColors = style({
  vars: { [gainFill]: tone.blue.fill, [lossFill]: tone.red.fill },
  '@media': { '(prefers-color-scheme: dark)': { vars: { [lossFill]: '#f0505e' } } },
  selectors: {
    ':root[data-theme="dark"] &': { vars: { [lossFill]: '#f0505e' } },
    ':root[data-theme="light"] &': { vars: { [lossFill]: tone.red.fill } },
  },
})

export const yearlyChart = style([gainLossColors, { display: 'flex', gap: vars.space.xs }])

export const yearColumn = style({
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: `${vars.space.xs} 2px`,
  borderRadius: vars.radius.sm,
  selectors: { '&:hover': { background: `color-mix(in srgb, ${vars.color.accent} 7%, transparent)` } },
})

/** 막대가 자라는 자리. 0 선의 위치는 양수·음수 최댓값 비율로 정한다(인라인 style). */
export const yearTrack = style({ position: 'relative', width: '100%', height: 140 })

export const zeroLine = style({ position: 'absolute', left: 0, right: 0, height: 1, background: vars.color.borderStrong })

const barBase = style({ position: 'absolute', left: '18%', right: '18%', minHeight: 2 })

/** 값 쪽 끝만 둥글게 — 0 선에서 어디로 자랐는지가 흐려지지 않게. */
export const gainBar = style([barBase, { background: gainFill, borderRadius: '4px 4px 0 0' }])
export const lossBar = style([barBase, { background: lossFill, borderRadius: '0 0 4px 4px' }])

export const trackNotice = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontSize: vars.fontSize.xs,
  color: vars.color.inkFaint,
})

export const yearValue = style({ fontSize: vars.fontSize.xs, fontWeight: vars.fontWeight.semibold, color: vars.color.ink, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })

export const yearLabel = style({ fontSize: vars.fontSize.xs, color: vars.color.inkMuted })

export const failure = style({
  margin: `${vars.space.sm} 0 0`,
  fontSize: vars.fontSize.sm,
  color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})`,
  whiteSpace: 'pre-wrap',
})

/** '회사 더하기' 창. 입력 칸 여섯 개가 두 줄에 들어가야 해서 확인 창(360px)보다 넓게 잡는다. */
export const addDialog = style({
  maxWidth: 720,
  maxHeight: 'calc(100vh - 48px)',
  overflowY: 'auto',
})

export const addDialogHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.space.lg,
})

/* ── 직원 수 · 입사 · 퇴사 ──────────────────────────────── */

/** 색은 카드 전체에 둔다 — 범례 견본도 같은 파랑·빨강을 써야 한다. */
export const flowFigure = style([gainLossColors, { margin: 0 }])

/** 위 꺾은선(직원 수)과 아래 막대(입사·퇴사)가 같은 달 칸을 쓴다. 칸 사이 간격을 두면 선의 점이 칸 가운데서 어긋난다. */
export const flowChart = style({ position: 'relative' })

export const flowLegend = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.md,
  margin: `0 0 ${vars.space.sm}`,
  fontSize: vars.fontSize.xs,
  color: vars.color.inkMuted,
})

export const flowLegendItem = style({ display: 'inline-flex', alignItems: 'center', gap: 6 })

const swatchBase = style({ display: 'inline-block', width: 10, height: 10, borderRadius: 2 })
export const hiredSwatch = style([swatchBase, { background: gainFill }])
export const leftSwatch = style([swatchBase, { background: lossFill }])
export const lineSwatch = style({ display: 'inline-block', width: 14, height: 2, borderRadius: 1, background: tone.blue.fill })

/** 꺾은선 층. 칸 위에 겹쳐 놓고 마우스는 아래 칸이 받는다. 선도 파랑이지만 입사 막대와 칸(위·아래)과 범례 모양(선·네모)이 달라 헷갈리지 않는다. */
export const flowLineLayer = style({ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' })

export const flowLineSvg = style({ display: 'block', width: '100%', height: '100%', overflow: 'visible' })

export const flowLine = style({ fill: 'none', stroke: tone.blue.fill, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' })

/** 점은 SVG 밖 HTML 로 둔다 — 늘어나는 viewBox 안에 원을 그리면 타원이 된다. 2px 바탕색 테두리로 선과 떨어뜨린다. */
export const flowDot = style({
  position: 'absolute',
  width: 8,
  height: 8,
  marginLeft: -4,
  marginTop: -4,
  borderRadius: '50%',
  background: tone.blue.fill,
  boxShadow: `0 0 0 2px ${vars.color.surface}`,
})

export const flowDotLabel = style({
  position: 'absolute',
  transform: 'translate(-50%, -150%)',
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkStrong,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
})

export const flowColumns = style({ display: 'flex' })

export const flowColumn = style({
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: vars.radius.sm,
})

export const flowColumnActive = style({ background: `color-mix(in srgb, ${vars.color.accent} 7%, transparent)` })

/** 마우스를 올린 달의 숫자. 꺾은선 층 위, 칸 가운데에 뜬다. 마우스를 가리지 않게 스스로는 마우스를 받지 않는다. */
export const flowTooltip = style({
  position: 'absolute',
  top: 4,
  zIndex: 1,
  minWidth: 132,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.12)',
  pointerEvents: 'none',
  fontSize: vars.fontSize.xs,
  color: vars.color.ink,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
})

export const flowTooltipMonth = style({ marginBottom: 4, fontWeight: vars.fontWeight.semibold, color: vars.color.inkStrong })

export const flowTooltipRow = style({ display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.7 })

/** 입사·퇴사 막대 둘이 나란히 자라는 자리. 막대 사이 2px 은 바탕색 틈이다. */
export const flowBarTrack = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  gap: 2,
  width: '100%',
  borderBottom: `1px solid ${vars.color.borderStrong}`,
})

const flowBarBase = style({ width: '28%', maxWidth: 14, minHeight: 1, borderRadius: '4px 4px 0 0' })
export const hiredBar = style([flowBarBase, { background: gainFill }])
export const leftBar = style([flowBarBase, { background: lossFill }])

export const flowMonth = style({ marginTop: 4, fontSize: vars.fontSize.xs, color: vars.color.inkMuted })
