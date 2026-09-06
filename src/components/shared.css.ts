import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'
import { button as consoleButton, card } from '@/styles/console.css'

/**
 * 화면들이 함께 쓰는 조각들. 치수는 앱인토스 콘솔 실측값을 따른다.
 *
 * 버튼은 console.css의 것을 그대로 쓴다 — 콘솔의 주 버튼은 파란 채움이 아니라
 * 옅은 파란 배경에 파란 글자다. 관리 화면은 버튼이 많아서, 채움을 쓰면
 * 화면이 파랗게 뒤덮인다.
 */
export { button, quietButton, dangerButton, card } from '@/styles/console.css'

export const input = style({
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.ink,
  borderRadius: 8,
  padding: `7px ${vars.space.md}`,
  fontSize: vars.fontSize.sm,
  selectors: {
    '&::placeholder': { color: vars.color.inkFaint },
    '&:focus': { outline: 'none', borderColor: vars.color.accent },
  },
})

export const formRow = style({
  display: 'flex',
  gap: vars.space.sm,
  marginBottom: vars.space.lg,
  flexWrap: 'wrap',
  alignItems: 'center',
})

/** 표는 카드 안에 들어간다 — 콘솔은 목록도 카드 위에 얹는다. */
export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: vars.fontSize.sm,
})

export const tableHead = style({
  textAlign: 'left',
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkFaint,
  fontSize: vars.fontSize.xs,
  padding: `0 ${vars.space.sm} ${vars.space.sm}`,
  borderBottom: `1px solid ${vars.color.border}`,
})

export const tableCell = style({
  padding: `${vars.space.md} ${vars.space.sm}`,
  borderBottom: `1px solid ${vars.color.border}`,
  verticalAlign: 'middle',
  color: vars.color.ink,
})

export const mutedText = style({
  color: vars.color.inkFaint,
  fontSize: vars.fontSize.xs,
})

/**
 * 긴 주소가 표를 밀어내지 않게 한 줄로 자른다.
 * 요기요·무신사처럼 추적 파라미터가 붙은 주소는 200자를 넘는다.
 */
export const truncatedUrl = style([
  mutedText,
  { display: 'block', maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
])

/** 조작 버튼이 놓이는 열. 너비를 고정해 표가 흔들리지 않게 한다. */
export const actionCell = style({
  width: 120,
  textAlign: 'right',
})

export const notice = style({
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderRadius: 12,
  background: vars.color.accentSoft,
  color: vars.color.accent,
  fontSize: vars.fontSize.sm,
  marginBottom: vars.space.lg,
})

export const errorNotice = style([
  notice,
  { background: vars.color.surfaceSunken, color: vars.color.brand },
])

export const hiddenRow = style({ opacity: 0.45 })

export const statRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: vars.space.lg,
  marginBottom: vars.space.xl,
})

export const statCard = card
export const statLabel = style({ fontSize: vars.fontSize.sm, color: vars.color.inkMuted })
export const statValue = style({
  marginTop: vars.space.xs,
  fontSize: 32,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '-0.03em',
})
export const statNote = style({ fontSize: vars.fontSize.xs, color: vars.color.inkFaint })
export const pageTitle = style({
  margin: `0 0 ${vars.space.lg}`,
  fontSize: 24,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
  letterSpacing: '-0.02em',
})
export const moreButton = consoleButton
