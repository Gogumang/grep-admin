import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'
import { tone } from '../styles/palette.css'

/** TDS Badge가 고르는 색. 팔레트에는 orange도 있지만 배지에는 없다. */
export const BADGE_COLORS = ['blue', 'teal', 'green', 'red', 'yellow', 'elephant'] as const

export const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  borderRadius: vars.radius.sm,
  fontFamily: vars.font.sans,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  // 배지는 글자 옆에 붙는 일이 많다. 줄 높이를 흔들지 않도록 세로 가운데로 내린다.
  verticalAlign: 'middle',
})

export const size = styleVariants({
  xsmall: { height: 18, padding: `0 ${vars.space.xs}`, fontSize: 11 },
  small: { height: 20, padding: `0 6px`, fontSize: vars.fontSize.xs },
  medium: { height: 24, padding: `0 ${vars.space.sm}`, fontSize: vars.fontSize.xs },
  large: { height: 28, padding: `0 ${vars.space.sm}`, fontSize: vars.fontSize.sm },
})

/**
 * 색조 × variant 조합을 미리 다 만들어 둔다. vanilla-extract는 빌드 시점에 클래스를 굽기
 * 때문에 런타임에 색 이름으로 스타일을 조립할 수 없다 — 12개를 나열하는 게 아니라
 * 팔레트 목록에서 펼치는 이유다.
 */
export const skins = Object.fromEntries(
  BADGE_COLORS.flatMap((name) => [
    [`${name}-fill`, style({ background: tone[name].fill, color: tone[name].onFill })],
    [`${name}-weak`, style({ background: tone[name].weak, color: tone[name].onWeak })],
  ]),
) as Record<string, string>
