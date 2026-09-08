import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'
import { tone } from '../styles/palette.css'

export const list = style({
  display: 'flex',
  alignItems: 'stretch',
  borderBottom: `1px solid ${vars.color.border}`,
  fontFamily: vars.font.sans,
  // 탭이 많아지면 줄바꿈 대신 가로로 흐르게 둔다 — 줄이 늘면 아래 내용이 통째로 밀린다.
  overflowX: 'auto',
  scrollbarWidth: 'none',
})

/** fluid=false면 남는 폭을 똑같이 나눠 가진다. true면 글자 폭만큼만 차지한다. */
export const fluid = styleVariants({
  false: {},
  true: {},
})

export const item = style({
  position: 'relative',
  border: 0,
  background: 'transparent',
  fontFamily: 'inherit',
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkFaint,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'color 120ms ease-out',
  selectors: {
    [`${fluid.false} &`]: { flex: 1 },
    '&:hover': { color: vars.color.inkSubtle },
    '&[aria-selected="true"]': { color: vars.color.inkStrong },
    // 밑줄은 가상 요소로 그린다. border-bottom을 쓰면 목록의 1px 선과 겹쳐 두 줄이 된다.
    '&[aria-selected="true"]::after': {
      content: '',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -1,
      height: 2,
      background: vars.color.inkStrong,
    },
  },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none' } },
})

export const size = styleVariants({
  large: { height: 48, padding: `0 ${vars.space.md}`, fontSize: vars.fontSize.md },
  small: { height: 36, padding: `0 ${vars.space.sm}`, fontSize: vars.fontSize.sm },
})

/**
 * 점을 글자에 붙이기 위한 기준점. 버튼에 직접 걸면 안 된다 — fluid=false일 때 버튼이 남는 폭을
 * 나눠 가져 넓어지므로, 점이 글자에서 멀찍이 떨어진 칸 끝에 가서 앉는다.
 */
export const itemLabel = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
})

/** 안 읽은 것이 있다는 빨간 점. TDS가 redBean(팥알)이라 부르는 것이다. */
export const redBean = style({
  position: 'absolute',
  top: -2,
  right: -8,
  width: 5,
  height: 5,
  borderRadius: vars.radius.full,
  background: tone.red.fill,
})
