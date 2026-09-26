import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 풀이 코드·케이스 입출력은 칸 맞춤이 뜻을 가진다 — 공백 하나가 오답을 가른다. */
const MONOSPACE_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.space.md,
  marginBottom: vars.space.lg,
})

export const titleRowTitle = style({ margin: 0 })

export const pushRight = style({ marginLeft: 'auto' })

export const problemLink = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
  selectors: { '&:hover': { color: vars.color.accent } },
})

export const numberCell = style({ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })

export const tagList = style({ display: 'flex', flexWrap: 'wrap', gap: vars.space.xs })

export const backLink = style({
  display: 'inline-block',
  marginBottom: vars.space.sm,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  selectors: { '&:hover': { color: vars.color.accent } },
})

/** 편집 화면의 한 덩어리(기본 정보·지문·참조 풀이·케이스). 카드마다 제목을 달아 긴 화면에서 길을 잃지 않게 한다. */
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
  gap: vars.space.md,
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

export const field = style({ display: 'flex', flexDirection: 'column', gap: vars.space.xs })

export const fieldLabel = style({ fontSize: vars.fontSize.xs, color: vars.color.inkMuted })

export const fieldHint = style({ fontSize: vars.fontSize.xs, color: vars.color.inkFaint })

/** 마크다운 원문과 미리보기를 나란히. 좁은 화면에서는 위아래로 쌓는다. */
export const markdownPair = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: vars.space.md,
  marginTop: vars.space.xs,
})

export const markdownSource = style({ minHeight: 160, resize: 'vertical', fontFamily: MONOSPACE_FONT, lineHeight: 1.5 })

export const markdownPreview = style({
  minHeight: 160,
  maxHeight: 480,
  overflowY: 'auto',
  padding: vars.space.md,
  borderRadius: 8,
  background: vars.color.surfaceSunken,
})

export const emptyPreview = style({ color: vars.color.inkFaint, fontSize: vars.fontSize.sm })

export const codeArea = style({
  width: '100%',
  minHeight: 240,
  resize: 'vertical',
  fontFamily: MONOSPACE_FONT,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.5,
  tabSize: 4,
})

export const caseList = style({ display: 'flex', flexDirection: 'column', gap: vars.space.md })

export const caseCard = style({
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.md,
})

export const caseHeader = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.space.sm,
  marginBottom: vars.space.sm,
})

export const caseNumber = style({ fontWeight: vars.fontWeight.semibold, color: vars.color.inkStrong })

export const exampleToggle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.fontSize.sm,
  cursor: 'pointer',
})

export const caseIO = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: vars.space.md,
})

export const caseText = style({
  width: '100%',
  minHeight: 96,
  resize: 'vertical',
  fontFamily: MONOSPACE_FONT,
  fontSize: vars.fontSize.sm,
})

/** 실패한 실행의 stderr·컴파일 오류. 길어도 화면을 밀어내지 않게 높이를 묶는다. */
export const runOutput = style({
  margin: `${vars.space.sm} 0 0`,
  maxHeight: 200,
  overflow: 'auto',
  padding: vars.space.sm,
  borderRadius: 8,
  background: vars.color.surfaceSunken,
  fontFamily: MONOSPACE_FONT,
  fontSize: vars.fontSize.xs,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
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

export const blockerList = style({
  margin: `0 0 ${vars.space.md}`,
  paddingLeft: vars.space.lg,
  fontSize: vars.fontSize.xs,
  color: vars.color.inkMuted,
})
