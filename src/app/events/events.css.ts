import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const section = style({ marginBottom: vars.space.xl })

export const sectionTitle = style({
  margin: `0 0 ${vars.space.md}`,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkMuted,
})

/**
 * 사이트 목록 썸네일(228:128)과 같은 비율. 올리지 않은 행사는 이미지가 없어 같은 크기의 회색 자리를 둔다 —
 * 자리가 없으면 올린 행사와 안 올린 행사의 제목 시작점이 어긋난다.
 */
export const thumbnail = style({
  display: 'block',
  width: 114,
  height: 64,
  borderRadius: vars.radius.sm,
  objectFit: 'cover',
  backgroundColor: vars.color.surfaceSunken,
})

export const titleLink = style({
  color: 'inherit',
  textDecoration: 'none',
  selectors: { '&:hover': { textDecoration: 'underline' } },
})

export const badges = style({ display: 'inline-flex', gap: vars.space.xs, marginLeft: vars.space.sm, verticalAlign: 'middle' })
