import { keyframes, style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

const riseUp = keyframes({ from: { opacity: 0, transform: 'translate(-50%, 8px)' }, to: { opacity: 1, transform: 'translate(-50%, 0)' } })
const dropDown = keyframes({ from: { opacity: 0, transform: 'translate(-50%, -8px)' }, to: { opacity: 1, transform: 'translate(-50%, 0)' } })

export const toast = style({
  position: 'fixed',
  left: '50%',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  maxWidth: 'min(520px, calc(100vw - 32px))',
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderRadius: vars.radius.lg,
  // 토스트는 어느 테마에서든 배경 위에 떠야 하므로 토큰 면색을 쓰지 않고 늘 어두운 면이다.
  background: 'rgba(23, 26, 31, 0.94)',
  color: '#ffffff',
  fontFamily: vars.font.sans,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.5,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.24)',
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
})

export const position = styleVariants({
  top: { top: 24, transform: 'translateX(-50%)', animation: `${dropDown} 160ms ease-out` },
  bottom: { bottom: 24, transform: 'translateX(-50%)', animation: `${riseUp} 160ms ease-out` },
})

export const message = style({ flex: 1, minWidth: 0 })

export const action = style({
  flexShrink: 0,
  border: 0,
  padding: 0,
  background: 'transparent',
  color: vars.color.accent,
  fontFamily: 'inherit',
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
})
