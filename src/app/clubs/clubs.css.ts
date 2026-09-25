import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const icon = style({ borderRadius: 6, flexShrink: 0, objectFit: 'contain', background: vars.color.surface })

export const initial = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  borderRadius: 6,
  background: vars.color.accentSoft,
  color: vars.color.accent,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
})

export const nameCell = style({ display: 'inline-flex', alignItems: 'center', gap: vars.space.sm })

export const clubName = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
  textDecoration: 'none',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})

export const titleRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.md,
})

export const titleActions = style({ display: 'flex', alignItems: 'center', gap: vars.space.sm })

export const sectionTitle = style({
  margin: `0 0 ${vars.space.sm}`,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const note = style({ display: 'block', marginTop: 2, fontSize: vars.fontSize.xs, color: vars.color.inkFaint })

export const checkCell = style({ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: vars.space.xs })

export const checkChanged = style({ display: 'inline-flex', alignItems: 'center', gap: vars.space.sm })

export const checkFailed = style({ color: vars.color.brand, fontWeight: vars.fontWeight.semibold })
