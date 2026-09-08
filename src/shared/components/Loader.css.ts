import { keyframes, style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

const spin = keyframes({ to: { transform: 'rotate(360deg)' } })

export const loader = style({
  display: 'inline-block',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: vars.radius.full,
  color: vars.color.inkFaint,
  animation: `${spin} 600ms linear infinite`,
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.4 } },
})

export const size = styleVariants({
  small: { width: 16, height: 16 },
  medium: { width: 24, height: 24, borderWidth: 3 },
  large: { width: 36, height: 36, borderWidth: 3 },
})

/** 화면 한가운데 세워 두는 자리. 목록을 기다리는 동안 패널이 텅 비어 보이지 않게 한다. */
export const center = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.space.xl,
})
