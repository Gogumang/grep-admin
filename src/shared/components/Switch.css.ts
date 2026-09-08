import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

export const root = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  width: 52,
  height: 32,
  flexShrink: 0,
  cursor: 'pointer',
  selectors: { '&[data-disabled="true"]': { cursor: 'not-allowed', opacity: 0.4 } },
})

/** Checkbox와 같은 이유로 input을 겹쳐 두고 투명하게만 만든다 (Checkbox.css.ts 주석 참조). */
export const input = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  opacity: 0,
  cursor: 'inherit',
})

export const track = style({
  width: '100%',
  height: '100%',
  borderRadius: vars.radius.full,
  background: vars.color.borderStrong,
  transition: 'background 160ms ease-out',
  selectors: {
    'input:checked ~ &': { background: vars.color.accent },
    'input:focus-visible ~ &': { outline: `2px solid ${vars.color.accent}`, outlineOffset: 2 },
  },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

/**
 * 손잡이. 트랙 위에 겹쳐 두고 translate로 민다 — left를 바꾸면 레이아웃을 다시 계산해
 * 저사양 기기에서 끊긴다.
 */
export const thumb = style({
  position: 'absolute',
  top: 4,
  left: 4,
  width: 24,
  height: 24,
  borderRadius: vars.radius.full,
  background: vars.color.surface,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  transition: 'transform 160ms ease-out',
  pointerEvents: 'none',
  selectors: { 'input:checked ~ &': { transform: 'translateX(20px)' } },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})
