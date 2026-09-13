import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 추가 창의 입력 두 줄. 다이얼로그가 좁아서(360px) 가로로 놓을 자리가 없다. */
export const fieldStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  marginTop: vars.space.sm,
  textAlign: 'left',
})

/**
 * 추가 창 안에서 실패를 알리는 줄.
 *
 * 창을 닫고 화면 위쪽 띠로 알리지 않는 이유 — 그러면 방금 친 이름과 주소가 사라져서
 * 오타 하나에 두 칸을 다시 쳐야 한다.
 */
export const fieldError = style({
  margin: 0,
  fontSize: vars.fontSize.xs,
  lineHeight: 1.5,
  color: vars.color.brand,
})

/** 스위치가 놓이는 열. 너비를 고정해 이름이 길어져도 표가 흔들리지 않게 한다. */
export const switchCell = style({
  width: 72,
  textAlign: 'right',
})

/** 끈 블로그는 흐리게 둔다 — 목록을 훑는 것만으로 무엇이 도는지 읽혀야 한다. */
export const inactiveRow = style({ opacity: 0.45 })
