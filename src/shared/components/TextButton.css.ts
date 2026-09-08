import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'
import { tone } from '../styles/palette.css'

export const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  border: 0,
  padding: 0,
  background: 'transparent',
  fontFamily: vars.font.sans,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: 1.4,
  cursor: 'pointer',
  textDecoration: 'none',
  selectors: {
    '&:hover:not(:disabled)': { textDecoration: 'underline' },
    '&:disabled': { cursor: 'not-allowed', opacity: 0.4 },
  },
})

export const size = styleVariants({
  small: { fontSize: vars.fontSize.xs },
  medium: { fontSize: vars.fontSize.sm },
  large: { fontSize: vars.fontSize.md },
})

export const color = styleVariants({
  primary: { color: vars.color.accent },
  danger: { color: tone.red.onWeak },
  neutral: { color: vars.color.inkMuted },
})
