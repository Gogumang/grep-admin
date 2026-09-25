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
  // 뷰포트에 고정한다. 페이지가 통째로 구르면 목록을 내릴 때 레일·사이드바까지 딸려 올라가
  // 어디에 있는지 알 수 없어진다 — 스크롤은 본문 혼자 맡는다.
  height: '100vh',
  '@media': {
    // 한 줄로 접히면 세로로 쌓이므로 높이를 풀어 평범한 페이지 스크롤로 돌려준다.
    '(max-width: 900px)': { gridTemplateColumns: '1fr', height: 'auto' },
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

/**
 * 넓은 화면에서는 왼쪽에 붙박인 메뉴, 좁은 화면에서는 왼쪽에서 밀려 나오는 서랍이다.
 *
 * 좁을 때 자리를 접는 것으로는 부족했다 — 세로로 쌓이면 로고·메뉴·로그아웃이 본문 위를
 * 한 화면 가까이 먹고, 목록을 내리면 메뉴가 위로 사라져 다른 화면으로 갈 길이 없어진다.
 * 그래서 흐름에서 빼내(fixed) 평소에는 왼쪽 밖에 두고, ☰ 를 누를 때만 덮어서 펼친다.
 */
export const sidebar = style({
  borderRight: `1px solid ${vars.color.border}`,
  padding: `${vars.space.lg} ${vars.space.lg} ${vars.space.xl}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.lg,
  overflowY: 'auto',
  '@media': {
    '(max-width: 900px)': {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      width: 260,
      maxWidth: '80vw',
      zIndex: 1200,
      background: vars.color.surface,
      borderRight: `1px solid ${vars.color.border}`,
      transform: 'translateX(-100%)',
      // 닫힌 서랍을 화면 밖에 두기만 하면 링크가 탭 순서에 남는다 — 보이지 않는 곳으로
      // 포커스가 넘어가면 어디에 있는지 알 수 없다. visibility 로 순서에서도 뺀다.
      visibility: 'hidden',
      transition: 'transform 180ms ease-out, visibility 180ms',
    },
  },
  selectors: {
    '&[data-open="true"]': {
      '@media': { '(max-width: 900px)': { transform: 'translateX(0)', visibility: 'visible' } },
    },
  },
})

/** 서랍 뒤를 덮는 어둠막. 본문을 누르면 닫힌다 — 서랍을 닫으려고 ☰ 를 다시 찾지 않게. */
export const menuDimmer = style({
  display: 'none',
  '@media': {
    '(max-width: 900px)': {
      display: 'block',
      position: 'fixed',
      inset: 0,
      zIndex: 1150,
      background: 'rgba(0, 0, 0, 0.4)',
    },
  },
})

/**
 * 좁은 화면에만 나오는 윗줄: ☰ · 로고 · 로그아웃.
 *
 * 스크롤을 따라 붙어 있게 한다. 목록이 길어도 메뉴로 돌아오려고 맨 위까지 올리지 않아도 된다.
 */
export const topBar = style({
  display: 'none',
  '@media': {
    '(max-width: 900px)': {
      display: 'flex',
      alignItems: 'center',
      gap: vars.space.md,
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      padding: `${vars.space.md} ${vars.space.lg}`,
      background: vars.color.canvas,
      borderBottom: `1px solid ${vars.color.border}`,
    },
  },
})

/** ☰ 버튼. 아이콘만 있으므로 aria-label 로 이름을 준다 (Shell.tsx). */
export const menuButton = style({
  display: 'grid',
  placeItems: 'center',
  width: 32,
  height: 32,
  border: 0,
  borderRadius: vars.radius.md,
  background: 'transparent',
  color: vars.color.ink,
  selectors: { '&:hover': { background: vars.color.surfaceSunken } },
})

/** 윗줄의 로그아웃을 오른쪽 끝으로 민다. */
export const topBarSpacer = style({ marginLeft: 'auto' })

/** 로고와 로그아웃은 좁은 화면에서 윗줄로 옮겨간다 — 서랍 안에 또 두면 같은 것이 둘이 된다. */
export const sidebarOnly = style({
  '@media': { '(max-width: 900px)': { display: 'none' } },
})

/** 로그아웃은 메뉴 아래 끝에 붙는다. 좁은 화면에서는 윗줄에 있으므로 감춘다. */
export const signOutForm = style([sidebarOnly, { marginTop: 'auto' }])

export const menu = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

/**
 * 지금 갈래가 아닌 메뉴. 넓은 화면에서는 레일이 갈래를 나누므로 감추고,
 * 좁은 화면에서는 레일이 없으므로 서랍 안에 함께 편다 — 그러지 않으면 글 갈래에서
 * 블로그로 갈 길이 화면에 없다.
 */
export const otherGroupMenu = style({
  display: 'none',
  '@media': { '(max-width: 900px)': { display: 'flex' } },
})

/** 서랍 안에서 갈래를 가르는 작은 제목. 레일이 없는 좁은 화면에서만 쓴다. */
export const menuGroupLabel = style({
  display: 'none',
  '@media': {
    '(max-width: 900px)': {
      display: 'block',
      margin: `${vars.space.sm} ${vars.space.md} ${vars.space.xs}`,
      fontSize: vars.fontSize.xs,
      fontWeight: vars.fontWeight.semibold,
      color: vars.color.inkFaint,
    },
  },
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
  // 세로 흐름 + 제 안에서 스크롤. 화면을 꽉 채워야 하는 페이지는 flex:1 한 줄로 늘어난다.
  // minHeight:0 이 없으면 그리드 항목이 내용 높이 밑으로 줄지 않아 overflow가 걸리지 않는다.
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflowY: 'auto',
  // 폭을 가두지 않는다 — 1100px 에 가두면 넓은 화면에서 오른쪽 절반이 비었다. 읽기 좋은 줄 폭은 글 미리보기가 스스로 잡는다.
  padding: `${vars.space.xl} ${vars.space.xxl} ${vars.space.xxxl}`,
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
