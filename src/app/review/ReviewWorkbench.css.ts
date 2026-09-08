import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 미리보기 / 편집 전환. 오른쪽 패널의 머리에 붙는다. */
export const tabBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  marginBottom: vars.space.lg,
  paddingBottom: vars.space.md,
  borderBottom: `1px solid ${vars.color.border}`,
})

export const tab = style({
  border: 0,
  background: 'transparent',
  borderRadius: vars.radius.md,
  padding: `${vars.space.xs} ${vars.space.md}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkMuted,
  cursor: 'pointer',
  selectors: { '&:hover': { background: vars.color.surfaceSunken } },
})

export const tabActive = style({
  background: vars.color.accentSoft,
  color: vars.color.accent,
})

/** 탭 오른쪽 끝으로 저장·공개를 밀어낸다. */
export const tabSpacer = style({ marginLeft: 'auto' })

/** 줄 전체가 상세로 가는 링크다. 체크박스가 있던 왼쪽 칸은 없앴다. */
export const pendingItem = style({
  display: 'block',
  padding: vars.space.sm,
  borderRadius: vars.radius.sm,
  transition: 'background 160ms ease-out',
  selectors: { '&:hover': { background: vars.color.surfaceSunken } },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

/**
 * 사이트와 같은 글 페이지 모습. postBody.css의 container는 700px 줄 폭을 위해
 * 좌우 여백을 크게 잡는데, 패널 안에서는 그 여백이 이중이 되므로 위아래만 남긴다.
 */
export const articlePreview = style({
  maxWidth: 700,
  margin: '0 auto',
})

/** 카드 미리보기와 글 페이지 미리보기를 가르는 이름표. */
export const previewLabel = style({
  margin: `0 0 ${vars.space.sm}`,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkFaint,
})

export const previewDivider = style({
  margin: `${vars.space.xl} 0`,
  border: 0,
  borderTop: `1px solid ${vars.color.border}`,
})

export const panel = style({
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  boxShadow: `0 0 0 1px ${vars.color.border}`,
  padding: vars.space.lg,
})

/** 목록 전용 패널. 화면 아래까지 내려가고, 넘치는 몫은 안쪽 목록이 스크롤한다. */
export const listPanel = style([
  panel,
  {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
])

export const panelTitle = style({
  margin: `0 0 ${vars.space.md}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkMuted,
})

/**
 * 스크롤은 여기가 맡는다. 예전에는 maxHeight 60vh 였는데, 패널이 화면 중간에서 끊기고
 * 그 아래가 통째로 비었다 — 높이를 짐작하지 말고 남은 자리를 그대로 받게 한다.
 *
 * minHeight:0 이 없으면 flex 자식이 내용 높이 밑으로 줄지 않아 목록이 패널을 밀어낸다.
 */
export const pendingList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
})

export const pendingTitle = style({
  display: 'block',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.inkStrong,
  lineHeight: 1.4,
})

export const pendingMeta = style({
  display: 'block',
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


/** 상세에서 목록으로 돌아가는 길. 페이지가 나뉘었으니 되돌아갈 문이 보여야 한다. */
export const backLink = style({
  display: 'inline-block',
  marginBottom: vars.space.sm,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  selectors: { '&:hover': { color: vars.color.accent } },
})
