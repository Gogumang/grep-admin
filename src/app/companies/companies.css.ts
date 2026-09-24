import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const selectedRow = style({ background: vars.color.surfaceSunken })

export const companyLink = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
  textDecoration: 'none',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})

export const sectionTitle = style({
  margin: `${vars.space.xl} 0 ${vars.space.md}`,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const archived = style({ fontSize: vars.fontSize.xs, color: vars.color.inkFaint, fontWeight: vars.fontWeight.regular })
