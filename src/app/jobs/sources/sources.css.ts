import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const titleRow = style({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: vars.space.md })

export const companyLink = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
  textDecoration: 'none',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})
