import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 목록 · 편집 · 미리보기 셋을 한 화면에 둔다 — 고치면서 결과를 봐야 하기 때문이다. */
export const workbench = style({
  display: 'grid',
  gridTemplateColumns: '260px minmax(0, 1fr) minmax(0, 1fr)',
  gap: vars.space.lg,
  alignItems: 'start',
  '@media': {
    // 좁은 화면에서 세 칸을 우겨넣으면 셋 다 못 쓴다. 세로로 쌓는다.
    '(max-width: 1100px)': { gridTemplateColumns: '1fr' },
  },
})

export const panel = style({
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  boxShadow: `0 0 0 1px ${vars.color.border}`,
  padding: vars.space.lg,
})

export const panelTitle = style({
  margin: `0 0 ${vars.space.md}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkMuted,
})

export const pendingList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  maxHeight: '60vh',
  overflowY: 'auto',
})

export const pendingRow = style({
  display: 'flex',
  gap: vars.space.sm,
  alignItems: 'flex-start',
  padding: vars.space.sm,
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  transition: 'background 160ms ease-out',
  selectors: { '&:hover': { background: vars.color.surfaceSunken } },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

export const pendingRowActive = style({ background: vars.color.accentSoft })

export const pendingTitle = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.inkStrong,
  lineHeight: 1.4,
})

export const pendingMeta = style({
  marginTop: 2,
  fontSize: vars.fontSize.xs,
  color: vars.color.inkMuted,
})

/** 본문을 못 읽은 글은 검토할 내용이 없다 — 목록에서 바로 구분되어야 한다. */
export const warningBadge = style({
  display: 'inline-block',
  marginLeft: vars.space.xs,
  padding: `0 ${vars.space.xs}`,
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})`,
  background: `color-mix(in oklab, ${vars.color.brand} 12%, transparent)`,
})

export const field = style({ marginBottom: vars.space.md })

export const label = style({
  display: 'block',
  marginBottom: vars.space.xs,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkMuted,
})

export const input = style({
  width: '100%',
  padding: `${vars.space.sm} ${vars.space.md}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: vars.color.canvas,
  color: vars.color.ink,
  fontSize: vars.fontSize.sm,
  fontFamily: 'inherit',
})

export const textarea = style([
  input,
  {
    minHeight: 120,
    lineHeight: 1.6,
    resize: 'vertical',
  },
])

/** 본문은 마크다운 원문을 그대로 고친다 — 서식 도구를 얹으면 원문이 오히려 망가진다. */
export const bodyEditor = style([
  textarea,
  {
    minHeight: 320,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: vars.fontSize.xs,
  },
])

export const actions = style({
  display: 'flex',
  gap: vars.space.sm,
  alignItems: 'center',
  marginTop: vars.space.md,
  flexWrap: 'wrap',
})

export const primaryButton = style({
  border: 0,
  borderRadius: vars.radius.md,
  padding: `${vars.space.sm} ${vars.space.lg}`,
  background: vars.color.accentHover,
  color: vars.color.onAccent,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  selectors: { '&:disabled': { opacity: 0.45, cursor: 'default' } },
})

export const quietButton = style([
  primaryButton,
  { background: vars.color.surfaceSunken, color: vars.color.ink },
])

export const dangerButton = style([
  primaryButton,
  {
    background: `color-mix(in oklab, ${vars.color.brand} 12%, transparent)`,
    color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})`,
  },
])

export const notice = style({
  margin: `${vars.space.sm} 0 0`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

export const errorNotice = style([notice, { color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})` }])

/** 미리보기 카드 — 목록 화면에서 이 글이 어떻게 보일지. */
export const cardPreview = style({
  display: 'flex',
  gap: vars.space.md,
  padding: vars.space.md,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  marginBottom: vars.space.lg,
})

export const cardThumbnail = style({
  width: 120,
  height: 66,
  objectFit: 'cover',
  borderRadius: vars.radius.md,
  flexShrink: 0,
  background: vars.color.surfaceSunken,
})

export const cardTitle = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
  lineHeight: 1.4,
})

export const cardSummary = style({
  margin: `${vars.space.xs} 0 0`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  lineHeight: 1.5,
})

export const emptyState = style({
  padding: `${vars.space.xxxl} ${vars.space.lg}`,
  textAlign: 'center',
  color: vars.color.inkMuted,
  fontSize: vars.fontSize.sm,
})
