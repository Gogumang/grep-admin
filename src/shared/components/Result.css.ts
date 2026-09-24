import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 그림 · 제목 · 설명 · 버튼을 가운데로 세운다. 목록이 비었을 때 카드 자리를 채우는 높이를 갖는다. */
export const root = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: `${vars.space.xxl} ${vars.space.lg}`,
  fontFamily: vars.font.sans,
})

export const figure = style({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: vars.space.lg,
})

/** TDS 타이포 t4(20px)를 토큰 xl에 맞췄다. */
export const title = style({
  margin: 0,
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.bold,
  lineHeight: 1.4,
  color: vars.color.inkStrong,
})

export const description = style({
  margin: `${vars.space.sm} 0 0`,
  fontSize: vars.fontSize.md,
  lineHeight: 1.5,
  color: vars.color.inkMuted,
  // TDS 예시가 설명 안의 \n 으로 줄을 나눈다. 그대로 줄바꿈으로 보이게 한다.
  whiteSpace: 'pre-line',
})

export const button = style({ marginTop: vars.space.xl })
