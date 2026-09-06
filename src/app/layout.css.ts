import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const header = style({
  borderBottom: `1px solid ${vars.color.border}`,
  background: vars.color.canvas,
})

export const headerInner = style({
  maxWidth: 1080,
  margin: '0 auto',
  padding: `0 ${vars.space.lg}`,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xl,
})

export const wordmark = style({
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: '-0.03em',
  color: vars.color.inkStrong,
})

export const badge = style({
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.accent,
  background: vars.color.accentSoft,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  marginLeft: vars.space.sm,
})

export const nav = style({
  display: 'flex',
  gap: vars.space.lg,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

export const navLink = style({
  selectors: { '&:hover': { color: vars.color.accent } },
})

export const main = style({
  maxWidth: 1080,
  margin: '0 auto',
  padding: `${vars.space.xxl} ${vars.space.lg} ${vars.space.xxxl}`,
})
