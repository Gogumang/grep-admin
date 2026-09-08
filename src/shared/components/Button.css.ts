import { keyframes, style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'
import { tone } from '../styles/palette.css'

export const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.sm,
  border: 0,
  borderRadius: vars.radius.md,
  fontFamily: vars.font.sans,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: 1,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transition: 'background 120ms ease-out, color 120ms ease-out',
  selectors: {
    // TDS는 터치 전용이라 hover가 없다. 어드민은 마우스로 쓰는 화면이라 되살린다.
    '&:disabled': { cursor: 'not-allowed', opacity: 0.4 },
    // loading 중에는 opacity를 낮추지 않는다 — 스피너가 흐려져 도는지 알 수 없다.
    '&[data-loading="true"]': { cursor: 'progress', opacity: 1 },
  },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

/** TDS 치수 그대로다 — 모바일 기준이라 어드민 화면에서는 보통 small·medium을 쓴다. */
export const size = styleVariants({
  small: { height: 32, padding: `0 ${vars.space.md}`, fontSize: vars.fontSize.sm, borderRadius: vars.radius.sm },
  medium: { height: 40, padding: `0 ${vars.space.lg}`, fontSize: vars.fontSize.sm },
  large: { height: 48, padding: `0 ${vars.space.lg}`, fontSize: vars.fontSize.md },
  xlarge: { height: 56, padding: `0 ${vars.space.xl}`, fontSize: vars.fontSize.lg, borderRadius: vars.radius.lg },
})

export const display = styleVariants({
  /*
   * alignSelf가 있어야 세로 flex 안에서 글자 폭으로 남는다. 콘솔 본문(console.css의 main)이
   * 세로 flex라 기본값(stretch)이면 버튼이 화면 폭만큼 늘어난다 — inline이라는 이름과 어긋난다.
   */
  inline: { width: 'auto', alignSelf: 'flex-start' },
  block: { display: 'flex', width: '100%' },
  // TDS의 full은 좌우 여백을 뚫고 화면 폭을 채운다. 어드민에는 그 여백 규약이 없으므로
  // block과 같은 폭을 주되 모서리만 편다 — 패널 바닥에 붙는 CTA 자리를 위한 것이다.
  full: { display: 'flex', width: '100%', borderRadius: 0 },
})

const skin = (background: string, color: string, hover: string) =>
  style({
    background,
    color,
    selectors: { '&:hover:not(:disabled):not([data-loading="true"])': { background: hover } },
  })

/**
 * color × variant 조합. TDS는 fill이 채도 높은 면, weak이 옅은 면이다.
 * light/dark는 브랜드 색이 아니라 중립 면이라 토큰의 회색 계열을 그대로 쓴다.
 */
export const skins = {
  'primary-fill': skin(vars.color.accent, vars.color.onAccent, vars.color.accentHover),
  'primary-weak': skin(vars.color.accentSoft, vars.color.accent, vars.color.accentSoft),
  'danger-fill': skin(tone.red.fill, tone.red.onFill, tone.red.onWeak),
  'danger-weak': skin(tone.red.weak, tone.red.onWeak, tone.red.weak),
  'light-fill': skin(vars.color.surfaceSunken, vars.color.inkStrong, vars.color.border),
  'light-weak': skin('transparent', vars.color.inkSubtle, vars.color.surfaceSunken),
  'dark-fill': skin(vars.color.inkStrong, vars.color.surface, vars.color.inkSubtle),
  'dark-weak': skin(vars.color.surfaceSunken, vars.color.inkStrong, vars.color.border),
}

const spin = keyframes({ to: { transform: 'rotate(360deg)' } })

/**
 * 스피너. 버튼 글자색을 그대로 물려받아(currentColor) skin마다 따로 칠하지 않는다.
 * 테두리 한 변만 투명하게 두면 도는 것이 보인다.
 */
export const spinner = style({
  width: '1em',
  height: '1em',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: vars.radius.full,
  animation: `${spin} 600ms linear infinite`,
  '@media': {
    // 애니메이션을 끄면 정지한 원이 남아 '멈춘 스피너'로 오해된다. 아예 감춘다.
    '(prefers-reduced-motion: reduce)': { display: 'none' },
  },
})
