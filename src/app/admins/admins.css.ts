import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 불러오지 못한 계정도 같은 자리를 둔다 — 없으면 그 줄만 이름 시작점이 어긋난다. */
export const avatar = style({
  display: 'block',
  width: 40,
  height: 40,
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.surfaceSunken,
})

export const loginLink = style({
  color: 'inherit',
  textDecoration: 'none',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})

export const badge = style({ display: 'inline-flex', marginLeft: vars.space.sm, verticalAlign: 'middle' })
