import { keyframes, style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/**
 * 토스증권 로그인 화면에서 실측한 값이다 (2026-09-06, tossinvest.com/signin).
 * 골격만 빌리던 것을 색까지 같은 화면으로 맞췄다.
 *
 *   화면 바닥  #f6f7f9  (--wts-adaptive-backgroundScreen)
 *   카드       #ffffff / radius 16 / 그림자·테두리 없음
 *   기본 버튼  #3182f6 위 흰 글자 / radius 10
 *   배경 한 장 radial-gradient(closest-side, teal200 0%, rgba(49,130,246,.15) 70%, transparent 100%)
 *              height:300vh · top:-210vh · left:50% translateX(-50%)
 *
 * 회색 계열(#6b7684, #8b95a1, #e5e8eb, #191f28…)과 파랑(#3182f6)은 우리 토큰이 이미
 * 토스와 같은 값이라 토큰을 그대로 쓴다. 팔레트에 없는 건 아래 두 색뿐이다.
 */

/**
 * 화면 바닥(#f6f7f9)은 이제 canvas 토큰이 같은 값이라 토큰으로 쓴다.
 * teal 만 우리 팔레트에 없는데, 이 화면의 장식으로만 쓰므로 계약에 올리지 않고 여기 가둔다.
 */
const TOSS_TEAL = '#89d8d8' // --wts-adaptive-teal200

/**
 * 라이트/다크 두 값을 theme.css.ts와 같은 세 갈래로 건다.
 * 시스템 설정만 보면 사용자가 data-theme으로 고른 값이 이 레이어에만 반영되지 않는다.
 */
const themedBackground = (light: string, dark: string) => ({
  background: light,
  '@media': {
    '(prefers-color-scheme: dark)': { background: dark },
  },
  selectors: {
    ':root[data-theme="dark"] &': { background: dark },
    ':root[data-theme="light"] &': { background: light },
  },
})

/*
 * 토스는 마지막 정지점을 rgba(255,255,255,0)으로 적지만, 그라디언트 보간이 알파를 미리 곱해
 * 계산하므로 transparent와 같은 결과다 — 배경색이 뒤바뀌는 다크에서도 회색 띠가 생기지 않는다.
 *
 * 가운데 파랑은 vars.color.accent를 15%로 섞는다. 라이트에서 우리 accent가 토스와 같은
 * #3182f6이라 실측값 rgba(49,130,246,0.15)와 정확히 일치하고, 다크에서는 알아서 따라간다.
 */
const lightWash = `radial-gradient(closest-side,
  ${TOSS_TEAL} 0%,
  color-mix(in srgb, ${vars.color.accent} 15%, transparent) 70%,
  transparent 100%)`

// 다크에서 teal200을 그대로 두면 어두운 화면에 형광 얼룩이 된다. 색은 남기고 세기만 줄인다.
const darkWash = `radial-gradient(closest-side,
  color-mix(in srgb, ${TOSS_TEAL} 26%, transparent) 0%,
  color-mix(in srgb, ${vars.color.accent} 14%, transparent) 70%,
  transparent 100%)`

export const page = style({
  position: 'relative',
  minHeight: '100dvh',
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  overflow: 'hidden',
  // 카드가 흰색이므로 바닥은 한 단 내려야 한다. canvas 가 라이트·다크 양쪽에서 그 값이다.
  background: vars.color.canvas,
})

/**
 * 배경 한 장. 토스와 같은 기하로 깐다 — 화면 세 배 크기의 정사각형을 위로 210vh 끌어올려
 * 꼬리만 걸치게 한다. 중심이 화면 안에 들어오면 '어디가 중심인지 보이는 얼룩'이 되고,
 * 밖으로 빼야 색이 공기처럼 읽힌다.
 */
export const wash = style({
  position: 'fixed',
  top: '-210vh',
  left: '50%',
  transform: 'translateX(-50%)',
  height: '300vh',
  aspectRatio: '1 / 1',
  // position:fixed는 조상의 overflow:hidden으로 잘리지 않는다. 이게 없으면 가로 스크롤이 생긴다.
  // 300vh 정사각형을 가운데 두었으니 좌우로 (150vh - 50vw)씩 잘라 뷰포트에 맞춘다.
  clipPath: 'inset(210vh calc(150vh - 50vw) 0)',
  pointerEvents: 'none',
  ...themedBackground(lightWash, darkWash),
})

export const header = style({
  position: 'relative',
  padding: `${vars.space.lg} ${vars.space.xl}`,
})

/** Shell의 워드마크와 같은 모양 — 로그인 전후로 같은 제품처럼 보여야 한다. */
export const wordmark = style({
  display: 'inline-block',
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: '-0.03em',
  color: vars.color.inkStrong,
})

export const center = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${vars.space.xl} ${vars.space.lg} ${vars.space.xxxl}`,
  // 완전한 수직 중앙보다 살짝 위가 안정적으로 보인다.
  paddingBottom: '14vh',
})

export const title = style({
  margin: `0 0 ${vars.space.xxl}`,
  fontSize: vars.fontSize.xxl,
  fontWeight: vars.fontWeight.bold,
  lineHeight: 1.3,
  letterSpacing: '-0.03em',
  color: vars.color.inkStrong,
  textAlign: 'center',
  textWrap: 'balance',
  '@media': {
    '(max-width: 480px)': { fontSize: vars.fontSize.xl },
  },
})

/** 카드 한 장이 자리를 잡는 정도. 페이지가 연출을 시작하면 안 된다. */
const riseIn = keyframes({
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'none' },
})

export const card = style({
  width: '100%',
  maxWidth: 400,
  padding: 32,
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  // 토스 카드는 그림자도 테두리도 없다. 바닥이 #f6f7f9로 한 단 내려가서
  // 흰 카드가 스스로 떠오르기 때문이다 — 경계를 그릴 이유가 사라졌다.
  animation: `${riseIn} 260ms cubic-bezier(0.22, 1, 0.36, 1) both`,
  '@media': {
    '(max-width: 480px)': { padding: vars.space.lg },
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
})

export const cardLead = style({
  margin: `0 0 ${vars.space.lg}`,
  fontSize: vars.fontSize.md,
  lineHeight: 1.6,
  color: vars.color.inkMuted,
  textAlign: 'center',
})

/**
 * 콘솔의 기본 버튼은 일부러 파란 채움이 아니다 (버튼이 많아 화면이 파래지니까).
 * 여기는 화면에 버튼이 하나뿐이라 그 이유가 성립하지 않는다 — 채워서 눈이 갈 곳을 하나로 만든다.
 */
export const submit = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.sm,
  width: '100%',
  height: 52,
  border: 0,
  borderRadius: vars.radius.md,
  /*
   * GitHub OAuth 버튼은 검정 배경 + 흰 글자와 흰 마크가 관례다. 파란 버튼으로 두면
   * "우리 서비스의 파란 버튼"으로 읽히고 GitHub로 간다는 신호가 약해진다.
   *
   * 다크에서는 검정 버튼이 배경에 묻으므로 흑백을 뒤집는다 — GitHub도 그렇게 한다.
   * inkStrong/canvas 두 토큰이 테마마다 반대로 뒤집혀서 별도 분기 없이 맞는다
   * (라이트: #191f28 위 #f6f7f9, 다크: #ffffff 위 #0f1319).
   */
  background: vars.color.inkStrong,
  color: vars.color.canvas,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.semibold,
  transition: 'background 160ms cubic-bezier(0.22, 1, 0.36, 1), transform 160ms cubic-bezier(0.22, 1, 0.36, 1)',
  selectors: {
    // 배경 쪽으로 살짝 섞는다 — 라이트에서는 밝아지고 다크에서는 어두워진다.
    '&:hover:not(:disabled)': {
      background: `color-mix(in oklab, ${vars.color.inkStrong} 86%, ${vars.color.canvas})`,
    },
    '&:active:not(:disabled)': { transform: 'scale(0.985)' },
    '&:disabled': { opacity: 0.55, cursor: 'progress' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { transition: 'none' },
  },
})

export const submitIcon = style({ flexShrink: 0 })

/** 허용되지 않은 계정으로 들어왔을 때 쓰는 보조 버튼. */
export const secondary = style({
  width: '100%',
  height: 48,
  border: 0,
  borderRadius: vars.radius.md,
  background: vars.color.surfaceSunken,
  color: vars.color.ink,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.semibold,
  transition: 'filter 160ms ease-out',
  selectors: { '&:hover': { filter: 'brightness(0.97)' } },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

/** 로그인한 계정을 보여주는 칩. 어떤 계정으로 막혔는지 모르면 고칠 수가 없다. */
export const identity = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  padding: vars.space.md,
  marginBottom: vars.space.lg,
  borderRadius: vars.radius.lg,
  // 채운 상자를 카드 안에 또 넣지 않는다. 테두리만으로 묶고 배경은 카드 그대로 —
  // 회색 위에 놓인 보조 문구가 4.2:1로 떨어지는 것도 함께 피한다.
  border: `1px solid ${vars.color.border}`,
})

export const avatar = style({
  width: 36,
  height: 36,
  borderRadius: vars.radius.full,
  flexShrink: 0,
})

export const identityName = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkStrong,
})

export const identityNote = style({
  margin: `2px 0 0`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

export const alert = style({
  margin: `0 0 ${vars.space.lg}`,
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderRadius: vars.radius.lg,
  background: `color-mix(in oklab, ${vars.color.brand} 10%, transparent)`,
  // 브랜드색을 그대로 글자에 쓰면 같은 색 틴트 위에서 3.4:1 밖에 안 나온다.
  // inkStrong 쪽으로 당겨 색은 남기고 대비만 확보한다 (라이트는 어두워지고 다크는 밝아진다).
  color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})`,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.5,
  fontWeight: vars.fontWeight.medium,
})
