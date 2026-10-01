import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 표지는 책 비율(가로:세로 ≈ 2:3)로 둔다. 그곳마다 표지 크기가 달라 칸을 고정해야 줄이 흔들리지 않는다. */
export const cover = style({
  display: 'block',
  width: 48,
  height: 72,
  objectFit: 'cover',
  borderRadius: vars.radius.sm,
  background: vars.color.surfaceSunken,
})

export const coverCell = style({ width: 64 })

export const bookTitle = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
  selectors: { '&:hover': { color: vars.color.accent } },
})
