import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const tabs = style({ marginBottom: vars.space.lg })

/** 차트 옆에 달력. 좁은 화면에서는 달력이 차트 위로 올라간다 — 날을 고르고 아래로 읽어 내려간다. */
export const layout = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 320px',
  alignItems: 'start',
  gap: vars.space.lg,
  '@media': { '(max-width: 900px)': { gridTemplateColumns: 'minmax(0, 1fr)' } },
})

export const chartColumn = style({ minWidth: 0, '@media': { '(max-width: 900px)': { order: 2 } } })

export const calendarColumn = style({ position: 'sticky', top: vars.space.lg, '@media': { '(max-width: 900px)': { position: 'static', order: 1 } } })

export const row = style({
  display: 'grid',
  gridTemplateColumns: '56px minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: vars.space.md,
  padding: `${vars.space.md} ${vars.space.lg}`,
  selectors: { '&:not(:last-child)': { borderBottom: `1px solid ${vars.color.border}` } },
})

/** 순위 숫자와 변동을 세로로 쌓는다 — 멜론 차트처럼 숫자가 먼저 눈에 들어와야 한다. */
export const rankCell = style({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 })

export const rank = style({
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.1,
})

const movement = style({ fontSize: vars.fontSize.xs, fontWeight: vars.fontWeight.semibold, fontVariantNumeric: 'tabular-nums' })
/** 오르면 빨강, 내리면 파랑 — 국내 차트(멜론·주식)의 관례를 따른다. */
export const up = style([movement, { color: vars.color.brand }])
export const down = style([movement, { color: vars.color.accent }])
export const same = style([movement, { color: vars.color.inkFaint }])
export const isNew = style([movement, { color: vars.color.brand, letterSpacing: '0.02em' }])

export const body = style({ minWidth: 0 })

export const name = style({
  display: 'block',
  color: vars.color.ink,
  textDecoration: 'none',
  fontSize: vars.fontSize.md,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})

export const owner = style({ color: vars.color.inkMuted })
export const repositoryName = style({ fontWeight: vars.fontWeight.semibold, color: vars.color.inkStrong })

export const description = style({
  margin: '2px 0 0',
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const meta = style({ margin: '2px 0 0', fontSize: vars.fontSize.xs, color: vars.color.inkFaint })

export const gained = style({ textAlign: 'right', whiteSpace: 'nowrap' })
export const gainedCount = style({
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
  fontVariantNumeric: 'tabular-nums',
})
export const gainedLabel = style({ fontSize: vars.fontSize.xs, color: vars.color.inkFaint })
