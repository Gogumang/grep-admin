import { style } from '@vanilla-extract/css'
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

/** 표가 좁은 화면에서 넘치면 카드 안에서만 옆으로 민다 — 페이지 전체가 가로로 밀리지 않게. */
export const tableScroller = style({ overflowX: 'auto' })

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

export const failure = style({
  margin: `${vars.space.sm} 0 0`,
  fontSize: vars.fontSize.sm,
  color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})`,
  whiteSpace: 'pre-wrap',
})
