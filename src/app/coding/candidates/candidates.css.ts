import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 수집처·난이도·검색이 한 줄. 좁으면 다음 줄로 넘어간다. */
export const filters = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.space.md,
  marginBottom: vars.space.lg,
})

export const search = style({ display: 'flex', alignItems: 'center', gap: vars.space.sm, marginLeft: 'auto' })

/** 그곳 표기(Lv. 2 · Medium)는 흐리게 — 우리 난이도 배지가 먼저 읽히게. */
export const difficultyLabel = style({ marginLeft: vars.space.xs, fontSize: vars.fontSize.xs, color: vars.color.inkFaint })

export const pager = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.lg,
  marginTop: vars.space.lg,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})
