import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/**
 * 진짜 input은 화면에서 감추되 지우지 않는다 — display:none으로 없애면 탭 이동과
 * 스크린리더에서 사라지고, 폼 전송에서도 빠진다. 겹쳐 두고 투명하게만 만든다.
 */
export const root = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  cursor: 'pointer',
  selectors: { '&[data-disabled="true"]': { cursor: 'not-allowed', opacity: 0.4 } },
})

export const input = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  opacity: 0,
  cursor: 'inherit',
})

const markBase = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  transition: 'background 120ms ease-out, border-color 120ms ease-out',
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
} as const

/** Circle — 체크 표시가 동그라미 안에 든다. 켜지면 면이 통째로 브랜드 색이 된다. */
export const circle = style({
  ...markBase,
  borderRadius: vars.radius.full,
  border: `2px solid ${vars.color.borderStrong}`,
  background: 'transparent',
  color: vars.color.borderStrong,
  selectors: {
    'input:checked ~ &': {
      borderColor: vars.color.accent,
      background: vars.color.accent,
      color: vars.color.onAccent,
    },
    'input:focus-visible ~ &': { outline: `2px solid ${vars.color.accent}`, outlineOffset: 2 },
  },
})

/** Line — 체크 표시만 홀로 선다. 목록에서 여러 줄이 나란할 때 테두리가 시끄러워지는 자리용. */
export const line = style({
  ...markBase,
  color: vars.color.borderStrong,
  selectors: {
    'input:checked ~ &': { color: vars.color.accent },
    'input:focus-visible ~ &': { outline: `2px solid ${vars.color.accent}`, outlineOffset: 2 },
  },
})

/** 라디오는 체크 대신 가운데 점이다. 모양이 다르면 하나만 고를 수 있다는 게 눈에 보인다. */
export const radioDot = style({
  width: '40%',
  height: '40%',
  borderRadius: vars.radius.full,
  background: 'currentColor',
})
