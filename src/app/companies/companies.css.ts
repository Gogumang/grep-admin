import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 회사 카드 격자. 좁은 화면에서는 두 줄, 넓으면 여러 줄로 흐른다. */
export const companyGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: vars.space.sm,
  listStyle: 'none',
  margin: 0,
  padding: 0,
})

export const companyCard = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.ink,
  textDecoration: 'none',
  transition: 'border-color 120ms ease-out',
  selectors: { '&:hover': { borderColor: vars.color.borderStrong } },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

/** 고른 회사. 칠하지 않고 테두리 색으로만 표시한다. */
export const companyCardSelected = style({ borderColor: vars.color.accent, background: vars.color.accentSoft })

/** 조직 로고는 대부분 정사각형이다. 둥근 사각형으로 잘라 로고마다 다른 여백을 가린다. */
export const companyLogo = style({
  flexShrink: 0,
  borderRadius: vars.radius.sm,
  objectFit: 'cover',
  background: vars.color.surfaceSunken,
})

export const companyName = style({
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkStrong,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const sectionTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  margin: `${vars.space.xl} 0 ${vars.space.md}`,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const archived = style({ fontSize: vars.fontSize.xs, color: vars.color.inkFaint, fontWeight: vars.fontWeight.regular })
