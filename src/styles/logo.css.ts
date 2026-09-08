import { style } from '@vanilla-extract/css'
import { vars } from './contract.css'

/**
 * 로고의 색과 크기. 모양은 Logo.tsx의 패스가 들고 있다.
 *
 * 심볼만 브랜드 초록이고 글자는 먹색이다. 글자까지 초록으로 칠하면 사이드바에서
 * 메뉴보다 앞으로 나와 로고가 화면의 주인공이 된다.
 */

/**
 * 브랜드 초록. 원본은 grep 저장소의 palette.tokens.json (brand.500 / brand.400)이고,
 * 어드민 토큰 계약에는 아직 이 색이 없어 여기 가둬 둔다 — login.css.ts의 teal과 같은 처지다.
 *
 * (어드민 build 토큰의 `brand`(#f63155)는 사이트가 초록으로 바뀌기 전 값이 남은 것이다.
 *  지금은 로그인 화면의 오류 알림에만 쓰이므로 여기서 참조하지 않는다.)
 */
const BRAND_GREEN_LIGHT = '#079743'
const BRAND_GREEN_DARK = '#09d25d'

/**
 * 라이트/다크를 theme.css.ts와 같은 세 갈래로 건다.
 * 시스템 설정만 보면 사용자가 data-theme으로 고른 값이 이 색에만 반영되지 않는다.
 */
const themedColor = (light: string, dark: string) => ({
  color: light,
  '@media': {
    '(prefers-color-scheme: dark)': { color: dark },
  },
  selectors: {
    ':root[data-theme="dark"] &': { color: dark },
    ':root[data-theme="light"] &': { color: light },
  },
})

/**
 * 크기는 높이 하나로 정한다 — 폭은 뷰박스 비율을 따라간다 (수식어 유무로 달라진다).
 *
 * 뷰박스가 잉크에 딱 맞아 글자 줄 높이 같은 여백이 없다. 위아래 4px을 붙여 24px 상자로
 * 만든다 — 이게 없으면 로고를 넣는 자리마다 아래 요소가 위로 딸려 올라간다.
 */
export const logo = style({
  display: 'block',
  height: 16,
  width: 'auto',
  marginBlock: 4,
})

export const symbol = style(themedColor(BRAND_GREEN_LIGHT, BRAND_GREEN_DARK))

export const name = style({ fill: vars.color.inkStrong })

/** 수식어는 색으로 물러난다 — 굵기 차이는 이미 패스에 구워져 있다. */
export const label = style({ fill: vars.color.inkFaint })
