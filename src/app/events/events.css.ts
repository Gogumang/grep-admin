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

export const controls = style({ display: 'inline-flex', gap: vars.space.xs })

/** 올리기 창 안 입력 칸. 다이얼로그가 좁아서(360px) 세로로 쌓는다. */
export const fieldStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  marginTop: vars.space.sm,
  textAlign: 'left',
})

export const fieldHint = style({ margin: 0, fontSize: vars.fontSize.sm, lineHeight: 1.5, color: vars.color.inkMuted })

/** 창을 닫지 않고 그 자리에서 알린다 — 닫으면 방금 넣은 주소가 사라진다. */
export const fieldError = style({ margin: 0, fontSize: vars.fontSize.xs, lineHeight: 1.5, color: vars.color.brand })
