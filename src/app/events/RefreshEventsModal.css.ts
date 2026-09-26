import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 판매처 다섯 곳과 뒤 단계 셋이 한 창에 들어가야 해서 확인 창(360px)보다 넓게 잡는다. */
export const dialog = style({
  maxWidth: 440,
  maxHeight: 'calc(100vh - 48px)',
  overflowY: 'auto',
})

export const summary = style({
  margin: `${vars.space.sm} 0 ${vars.space.md}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})

export const outcomeFailed = style({
  margin: `${vars.space.md} 0 0`,
  fontSize: vars.fontSize.sm,
  lineHeight: 1.6,
  color: vars.color.brand,
})

export const skipped = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.inkMuted,
})

/** 줄 왼쪽 원 안의 판매처 아이콘. 원을 꽉 채운다. */
export const sourceIcon = style({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})
