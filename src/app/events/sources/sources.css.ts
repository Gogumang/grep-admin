import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const titleRow = style({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: vars.space.md })

export const cards = style({ display: 'grid', gap: vars.space.lg, marginTop: vars.space.lg })

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space.md} ${vars.space.lg}`,
})

export const sourceName = style({ margin: 0, fontSize: vars.fontSize.lg, fontWeight: vars.fontWeight.bold })
globalStyle(`${sourceName} a`, { color: vars.color.inkStrong, textDecoration: 'none' })

export const stats = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: vars.space.md,
  margin: 0,
  padding: `0 ${vars.space.lg} ${vars.space.md}`,
})
globalStyle(`${stats} dt`, { fontSize: vars.fontSize.xs, color: vars.color.inkFaint })
globalStyle(`${stats} dd`, { margin: 0, fontSize: vars.fontSize.md, fontWeight: vars.fontWeight.semibold, color: vars.color.inkStrong })
