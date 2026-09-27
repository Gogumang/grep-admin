import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.space.md,
  marginBottom: vars.space.lg,
})

export const titleRowTitle = style({ margin: 0 })

export const pushRight = style({ marginLeft: 'auto' })

export const reportLink = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
  selectors: { '&:hover': { color: vars.color.accent } },
})

export const numberCell = style({ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })

/** 전형 흐름(서류 → 코테 → 기술면접). 칸이 좁아도 단계가 중간에서 끊기지 않게 단계마다 묶는다. */
export const stageFlow = style({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: vars.space.xs })

export const stageArrow = style({ color: vars.color.inkFaint, fontSize: vars.fontSize.xs })

export const filterRow = style({ display: 'flex', flexWrap: 'wrap', gap: vars.space.xs, marginBottom: vars.space.md })

export const backLink = style({
  display: 'inline-block',
  marginBottom: vars.space.sm,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  selectors: { '&:hover': { color: vars.color.accent } },
})

export const actionBar = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.space.sm,
  padding: `${vars.space.sm} 0`,
  marginBottom: vars.space.md,
  background: vars.color.canvas,
})

export const counter = style({ fontSize: vars.fontSize.sm, color: vars.color.inkMuted, fontVariantNumeric: 'tabular-nums' })

export const failure = style({
  margin: `0 0 ${vars.space.md}`,
  fontSize: vars.fontSize.sm,
  color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})`,
  whiteSpace: 'pre-wrap',
})

export const section = style({
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  boxShadow: `0 0 0 1px ${vars.color.border}`,
  padding: vars.space.lg,
  marginBottom: vars.space.lg,
})

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.space.sm,
  marginBottom: vars.space.md,
})

export const sectionTitle = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const fieldGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: vars.space.md,
})

export const spacedGrid = style({ marginTop: vars.space.md })

export const field = style({ display: 'flex', flexDirection: 'column', gap: vars.space.xs })

export const wideField = style([field, { marginTop: vars.space.md }])

export const fieldLabel = style({ fontSize: vars.fontSize.xs, color: vars.color.inkMuted })

export const textArea = style({ width: '100%', minHeight: 72, resize: 'vertical', lineHeight: 1.5 })

export const questionList = style({ display: 'flex', flexDirection: 'column', gap: vars.space.sm, marginTop: vars.space.md })

export const questionCard = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.md,
})

export const questionHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  marginBottom: vars.space.sm,
})

export const addRow = style({ display: 'flex', gap: vars.space.sm, marginTop: vars.space.md })

export const questionNumber =style({ fontWeight: vars.fontWeight.semibold, color: vars.color.inkStrong })

export const questionFields = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: vars.space.md,
  marginTop: vars.space.sm,
})
