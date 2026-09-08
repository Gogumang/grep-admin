import { assignVars, createThemeContract, globalStyle } from '@vanilla-extract/css'

/**
 * TDS 색조(tone) 팔레트.
 *
 * 어드민 토큰 계약(styles/contract.css.ts)에는 파랑(accent) 하나뿐이라 배지·상태 표시에
 * 필요한 색조가 없다. 계약을 늘리려면 grep 저장소의 tokens JSON을 고쳐 다시 구워 와야 하는데,
 * src/tokens/build는 그 결과를 복사해 온 생성물이라 여기서 손대면 다음 복사 때 지워진다.
 * 그래서 색조만 이 파일에 가둔다 — styles/logo.css.ts의 브랜드 초록과 같은 처지다.
 * 계약에 색조가 들어오면 이 파일을 지우고 vars.color를 그대로 쓰면 된다.
 *
 * 값은 TDS 팔레트에 눈으로 맞춘 근사값이다. 정본이 아니므로 사이트와 정확히 같아야 하는
 * 자리(로고·브랜드 면)에는 쓰지 않는다.
 *
 * 각 색조는 네 갈래다 — fill 배경 / fill 위 글자 / weak 배경 / weak 위 글자.
 * TDS Badge의 variant가 fill·weak 둘뿐이라 그 이상은 만들지 않는다.
 */
export const tone = createThemeContract({
  blue: { fill: null, onFill: null, weak: null, onWeak: null },
  teal: { fill: null, onFill: null, weak: null, onWeak: null },
  green: { fill: null, onFill: null, weak: null, onWeak: null },
  red: { fill: null, onFill: null, weak: null, onWeak: null },
  yellow: { fill: null, onFill: null, weak: null, onWeak: null },
  orange: { fill: null, onFill: null, weak: null, onWeak: null },
  elephant: { fill: null, onFill: null, weak: null, onWeak: null },
})

/**
 * 색조 이름 목록. Badge·BarChart가 prop 타입을 여기서 끌어 쓴다.
 *
 * TDS는 컴포넌트마다 고르는 색이 다르다 — Badge에는 orange가 없고 BarChart에는 teal이 없다.
 * 팔레트는 합집합으로 두고, 각 컴포넌트가 자기 목록으로 좁힌다.
 */
export const TONE_NAMES = ['blue', 'teal', 'green', 'red', 'yellow', 'orange', 'elephant'] as const
export type ToneName = (typeof TONE_NAMES)[number]

const light = {
  blue: { fill: '#3182f6', onFill: '#ffffff', weak: '#e8f3ff', onWeak: '#1b64da' },
  teal: { fill: '#0d9488', onFill: '#ffffff', weak: '#e0f5f2', onWeak: '#0b7a70' },
  green: { fill: '#079743', onFill: '#ffffff', weak: '#e6f6ec', onWeak: '#067a36' },
  red: { fill: '#f04452', onFill: '#ffffff', weak: '#ffeced', onWeak: '#d32f3d' },
  yellow: { fill: '#f5a623', onFill: '#191f28', weak: '#fff5e0', onWeak: '#a86a00' },
  orange: { fill: '#f97316', onFill: '#ffffff', weak: '#ffeede', onWeak: '#c2560a' },
  elephant: { fill: '#6b7684', onFill: '#ffffff', weak: '#f2f4f6', onWeak: '#4e5968' },
}

/**
 * 다크에서 fill은 한 단 밝히고 weak은 배경에 녹인다. 라이트 값을 그대로 쓰면
 * weak 배경(거의 흰색)이 어두운 화면에서 홀로 빛나 배지가 조명처럼 보인다.
 */
const dark = {
  blue: { fill: '#4593fc', onFill: '#0b1524', weak: '#1c2f4a', onWeak: '#83b4fb' },
  teal: { fill: '#2dd4bf', onFill: '#08201d', weak: '#123b37', onWeak: '#5eead4' },
  green: { fill: '#09d25d', onFill: '#052613', weak: '#0f3822', onWeak: '#4ade80' },
  red: { fill: '#ff6b78', onFill: '#2a0d10', weak: '#42191d', onWeak: '#ff9aa3' },
  yellow: { fill: '#fbbf4d', onFill: '#241a05', weak: '#3d2f10', onWeak: '#fcd68a' },
  orange: { fill: '#fb923c', onFill: '#2a1405', weak: '#432411', onWeak: '#fdba74' },
  elephant: { fill: '#8b95a1', onFill: '#111418', weak: '#252a31', onWeak: '#b0b8c1' },
}

/**
 * theme.css.ts와 같은 세 갈래로 건다. 시스템 설정만 보면 사용자가 data-theme으로 고른 값이
 * 이 색들에만 반영되지 않아, 토글했을 때 배지 색만 따로 논다.
 */
globalStyle(':root', { vars: assignVars(tone, light) })
globalStyle(':root', { '@media': { '(prefers-color-scheme: dark)': { vars: assignVars(tone, dark) } } })
globalStyle(':root[data-theme="light"]', { vars: assignVars(tone, light) })
globalStyle(':root[data-theme="dark"]', { vars: assignVars(tone, dark) })
