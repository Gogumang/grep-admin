import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const progressBar = style({
  height: 6,
  borderRadius: vars.radius.full,
  background: vars.color.surfaceSunken,
  overflow: 'hidden',
  margin: `${vars.space.lg} 0`,
})

export const progressFill = style({
  height: '100%',
  background: vars.color.accent,
  transition: 'width 200ms ease-out',
})

export const log = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  fontSize: vars.fontSize.sm,
})

export const logRow = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space.sm,
  padding: `${vars.space.sm} 0`,
  borderBottom: `1px solid ${vars.color.border}`,
})

export const markOk = style({ color: vars.color.accent, fontWeight: vars.fontWeight.bold })
export const markFailed = style({ color: vars.color.brand, fontWeight: vars.fontWeight.bold })

export const blogName = style({ minWidth: 140, fontWeight: vars.fontWeight.medium })
export const detail = style({ color: vars.color.inkMuted })
