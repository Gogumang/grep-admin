import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/**
 * 앱인토스 블로그 목록에서 실측한 뼈대에서 출발했다 (2026-09-07, toss.im/apps-in-toss/blog):
 *   갈래 탭 17px/700 — 고른 것 #191f28, 나머지 #8b95a1 · 행 사이 선 없음
 *
 * 다만 배치는 세로 한 줄이 아니라 격자다 — 어드민에서 400개 가까운 글을 훑는 화면이라
 * 한 줄에 한 글씩 쌓으면 스크롤만 길어진다. 그래서 제목도 24px가 아니라 카드 크기에 맞춘다.
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
  // 세로로 한 줄씩 쌓지 않고 가로로 늘어놓는다. 화면이 넓으면 한 줄에 더 들어간다.
  display: 'grid',
  // 220px — 왼쪽 메뉴를 빼고 남는 폭(약 520px)에서도 두 칸이 서는 크기다.
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  // 선을 긋지 않으므로 간격이 글과 글을 가른다. 좁히면 어디까지가 한 글인지 흐려진다.
  // 위아래를 좌우보다 넓게 벌린다 — 같으면 아래 칸의 사진이 위 칸의 글에 붙어 보인다.
  columnGap: vars.space.xl,
  rowGap: vars.space.xxl,
})

/** 카드 하나. 사진이 위, 글이 아래 — 가로로 늘어놓으면 옆으로 붙일 자리가 없다. */
export const row = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

/** 숨긴 글도 목록에 남는다 — 다시 드러내려면 보여야 한다. 대신 흐리게 둔다. */
export const rowHidden = style({ opacity: 0.45 })

export const rowText = style({
  // 제목 줄 수가 카드마다 달라도 날짜·스위치는 카드 맨 아래에서 만난다 (아래 meta의 marginTop:auto).
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  marginTop: vars.space.md,
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
  fontSize: vars.fontSize.lg,
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
  margin: 0,
  // 제목이 짧은 카드에서도 아래로 내려가 한 줄에서 만난다.
  marginTop: 'auto',
  paddingTop: vars.space.md,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

/** 조회수. 날짜와 같은 줄에 서지만 눈에 먼저 들어오지는 않게 둔다. */
export const views = style({
  fontVariantNumeric: 'tabular-nums',
})

/** 숨김 스위치는 오른쪽 끝으로 민다 — 카드 폭이 저마다 달라도 같은 자리에 선다. */
export const spacer = style({ marginLeft: 'auto' })

export const thumbnail = style({
  width: '100%',
  // 높이를 고정하지 않고 비율로 잡는다 — 칸 폭이 화면에 따라 달라진다.
  aspectRatio: '3 / 2',
  borderRadius: vars.radius.lg,
  objectFit: 'cover',
  // 이미지가 없는 글도 자리를 같은 크기로 잡아야 카드 높이가 들쭉날쭉해지지 않는다.
  background: vars.color.surfaceSunken,
})

/**
 * 목록 끝의 안내 문구이자 눈금. 이것이 화면에 들어오면 다음 10개를 잇는다 —
 * "더 보기" 버튼을 누르지 않아도 되고, 한 번에 다 그리지도 않는다.
 */
export const loadingNotice = style({
  margin: `${vars.space.xl} 0 0`,
  textAlign: 'center',
  fontSize: vars.fontSize.sm,
  color: vars.color.inkFaint,
})
