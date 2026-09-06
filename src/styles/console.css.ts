import { style } from '@vanilla-extract/css'
import { vars } from './contract.css'

/**
 * 앱인토스 콘솔에서 실측한 값들.
 *
 * 브라우저에서 computed style을 재서 옮긴 것이지 눈대중이 아니다:
 *   사이드바 220px · 아이콘 레일 56px · 카드 radius 24px / padding 24px
 *   메뉴 14px/500 · 섹션 제목 20px/700 · 카드 제목 17px/700 · 설명 14px
 *   버튼: 옅은 파란 배경 + 파란 글자, radius 8px, padding 6px 10px, 14px/600
 *
 * 색만 grep 토큰으로 바꿔 썼다 — 토스 파랑을 이미 쓰고 있어서 그대로 맞물린다.
 */

export const shell = style({
  display: 'grid',
  gridTemplateColumns: '56px 220px minmax(0, 1fr)',
  minHeight: '100vh',
  '@media': {
    '(max-width: 900px)': { gridTemplateColumns: '1fr' },
  },
})

/** 왼쪽 끝 아이콘 레일. 제품을 오가는 자리라 라벨이 아주 작다. */
export const rail = style({
  borderRight: `1px solid ${vars.color.border}`,
  paddingTop: vars.space.lg,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.lg,
  '@media': {
    '(max-width: 900px)': { display: 'none' },
  },
})

export const railItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  fontSize: 10,
  color: vars.color.inkFaint,
  textAlign: 'center',
  lineHeight: 1.2,
})

export const railIcon = style({
  width: 28,
  height: 28,
  display: 'grid',
  placeItems: 'center',
  // 라벨과 같은 색을 따라간다 — 활성 여부는 railItemActive 한 곳에서만 정한다.
  color: 'inherit',
})

/** 고른 갈래는 칠하지 않고 글자와 아이콘을 진하고 굵게 만든다. */
export const railItemActive = style({
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.bold,
})

export const sidebar = style({
  borderRight: `1px solid ${vars.color.border}`,
  padding: `${vars.space.lg} ${vars.space.lg} ${vars.space.xl}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.lg,
  '@media': {
    '(max-width: 900px)': { borderRight: 0, borderBottom: `1px solid ${vars.color.border}` },
  },
})

export const wordmark = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: '-0.03em',
  color: vars.color.inkStrong,
})

export const wordmarkBadge = style({
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.accent,
  background: vars.color.accentSoft,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
})

export const menu = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

/** 메뉴 항목: 14px / 500. 실측값이다. */
export const menuLink = style({
  display: 'block',
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.md,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.inkMuted,
  selectors: {
    '&:hover': { background: vars.color.surfaceSunken, color: vars.color.ink },
  },
})

export const menuLinkActive = style({
  background: vars.color.surfaceSunken,
  color: vars.color.inkStrong,
  fontWeight: vars.fontWeight.semibold,
})

export const main = style({
  padding: `${vars.space.xl} ${vars.space.xxl} ${vars.space.xxxl}`,
  maxWidth: 1100,
  '@media': {
    '(max-width: 900px)': { padding: vars.space.lg },
  },
})

/** 워크스페이스 이름 자리: 24px / 700. */
export const pageTitle = style({
  margin: `0 0 ${vars.space.lg}`,
  fontSize: 24,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
  letterSpacing: '-0.02em',
})

/** 섹션 제목: 20px / 700. */
export const sectionTitle = style({
  margin: `${vars.space.xl} 0 ${vars.space.md}`,
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const cardRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: vars.space.lg,
})

/** 카드: radius 24px, padding 24px, 테두리 없이 옅은 그림자. 실측값이다. */
export const card = style({
  background: vars.color.surface,
  borderRadius: 24,
  padding: 24,
  boxShadow: '0 1px 3px rgba(14, 31, 47, 0.06), 0 0 0 1px rgba(14, 31, 47, 0.04)',
})

export const cardTitle = style({
  margin: 0,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const cardDescription = style({
  margin: `${vars.space.xs} 0 0`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

export const cardValue = style({
  margin: `${vars.space.sm} 0 0`,
  fontSize: 32,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '-0.03em',
})

/** 빈 상태: 제목 17px/700, 설명 14px. 실측값이다. */
export const emptyState = style({
  padding: `${vars.space.xxxl} ${vars.space.lg}`,
  textAlign: 'center',
})

export const emptyTitle = style({
  margin: 0,
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
})

export const emptyDescription = style({
  margin: `${vars.space.xs} 0 ${vars.space.lg}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

/**
 * 기본 버튼: 옅은 파란 배경 + 파란 글자.
 *
 * 콘솔의 주 버튼이 파란 채움이 아니라는 점이 인상을 결정한다 —
 * 관리 화면은 버튼이 많아서, 채움 버튼을 쓰면 화면이 파랗게 뒤덮인다.
 */
export const button = style({
  border: 0,
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  background: vars.color.accentSoft,
  color: vars.color.accent,
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover:not(:disabled)': { filter: 'brightness(0.96)' },
    '&:disabled': { opacity: 0.45, cursor: 'default' },
  },
})

export const quietButton = style([
  button,
  { background: vars.color.surfaceSunken, color: vars.color.inkMuted },
])

export const dangerButton = style([
  button,
  { background: 'transparent', color: vars.color.brand },
])
