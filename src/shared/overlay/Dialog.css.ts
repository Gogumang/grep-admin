import { keyframes, style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })
const popIn = keyframes({ from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } })

export const dimmer = style({
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.space.lg,
  background: 'rgba(0, 0, 0, 0.5)',
  animation: `${fadeIn} 120ms ease-out`,
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
})

export const dialog = style({
  width: '100%',
  maxWidth: 360,
  padding: vars.space.lg,
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
  fontFamily: vars.font.sans,
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
  animation: `${popIn} 140ms ease-out`,
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
})

export const title = style({
  margin: 0,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const description = style({
  margin: `${vars.space.sm} 0 0`,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.6,
  color: vars.color.inkMuted,
})

export const buttons = style({
  display: 'flex',
  gap: vars.space.sm,
  marginTop: vars.space.lg,
})
