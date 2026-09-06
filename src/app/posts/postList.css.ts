import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/**
 * 앱인토스 블로그 목록에서 실측한 뼈대다 (2026-09-07, toss.im/apps-in-toss/blog):
 *   갈래 탭 17px/700 — 고른 것 #191f28, 나머지 #8b95a1
 *   제목 24px/700 · 줄높이 1.4 · 썸네일 270×183 · 행 사이 선 없음
 *
 * 색은 우리 토큰이 이미 같은 값이라 그대로 쓴다 (inkStrong·inkFaint가 토스의 grey900·grey500).
 */

/** 갈래 줄. 버튼처럼 칠하지 않고 글자 색과 굵기로만 고른 것을 표시한다. */
export const tabs = style({
  display: 'flex',
  gap: vars.space.lg,
  marginBottom: vars.space.xl,
})

export const tab = style({
  border: 0,
  padding: 0,
  background: 'transparent',
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkFaint,
  cursor: 'pointer',
})

export const tabActive = style({ color: vars.color.inkStrong })

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  // 선을 긋지 않으므로 간격이 글과 글을 가른다. 좁히면 어디까지가 한 글인지 흐려진다.
  gap: vars.space.xxl,
})

export const row = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space.xl,
  '@media': {
    // 좁은 화면에서 썸네일이 글을 밀어내면 제목이 두세 글자씩 끊긴다.
    '(max-width: 700px)': { flexDirection: 'column' },
  },
})

/** 숨긴 글도 목록에 남는다 — 다시 드러내려면 보여야 한다. 대신 흐리게 둔다. */
export const rowHidden = style({ opacity: 0.45 })

export const rowText = style({
  flex: 1,
  minWidth: 0,
})

export const blogName = style({
  margin: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkFaint,
})

export const title = style({
  display: 'block',
  margin: `${vars.space.xs} 0 0`,
  fontSize: 24,
  fontWeight: vars.fontWeight.bold,
  lineHeight: 1.4,
  letterSpacing: '-0.02em',
  color: vars.color.inkStrong,
  selectors: { '&:hover': { textDecoration: 'underline' } },
})

export const meta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  margin: `${vars.space.md} 0 0`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

export const thumbnail = style({
  width: 240,
  height: 162,
  flexShrink: 0,
  borderRadius: vars.radius.lg,
  objectFit: 'cover',
  // 이미지가 없는 글도 자리를 같은 크기로 잡아야 제목 줄이 흔들리지 않는다.
  background: vars.color.surfaceSunken,
})
