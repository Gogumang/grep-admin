import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const filterBar = style({ display: 'flex', gap: vars.space.xs })

/** 조직 로고는 대부분 정사각형이다. 둥근 사각형으로 잘라 로고마다 다른 여백을 가린다. */
export const companyLogo = style({
  flexShrink: 0,
  borderRadius: vars.radius.sm,
  objectFit: 'cover',
  background: vars.color.surfaceSunken,
})

export const sectionTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  margin: `${vars.space.lg} 0 ${vars.space.md}`,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const archived = style({ fontSize: vars.fontSize.xs, color: vars.color.inkFaint, fontWeight: vars.fontWeight.regular })
