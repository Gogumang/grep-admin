import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const sourceLink = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
  textDecoration: 'none',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})
