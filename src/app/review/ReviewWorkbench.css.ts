import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 미리보기 / 편집 전환. 오른쪽 패널의 머리에 붙는다. */
export const tabBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  marginBottom: vars.space.lg,
  paddingBottom: vars.space.md,
  borderBottom: `1px solid ${vars.color.border}`,
})

/** 미리보기를 눌러 고친다는 안내. 탭이 있던 자리를 대신한다. */
export const editHint = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.inkFaint,
})

/** 탭 오른쪽 끝으로 저장·공개를 밀어낸다. */
export const tabSpacer = style({ marginLeft: 'auto' })

export const panel = style({
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  boxShadow: `0 0 0 1px ${vars.color.border}`,
  padding: vars.space.lg,
})

/** 목록 전용 패널. 화면 아래까지 내려가고, 넘치는 몫은 안쪽 목록이 스크롤한다. */
export const listPanel = style([
  panel,
  {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
])

/** 검토 작업대. 목록 패널과 같은 이유로 화면 아래까지 내려간다. */
export const editorPanel = style([
  panel,
  {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
])

/**
 * 미리보기·편집이 들어앉는 자리. 남은 높이를 받아 스크롤은 여기가 맡는다 —
 * 안쪽 editFields가 height:100%로 그 높이를 그대로 물려받아 본문 칸을 늘린다.
 */
export const editorBody = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
})

/**
 * 스크롤은 여기가 맡는다. 예전에는 maxHeight 60vh 였는데, 패널이 화면 중간에서 끊기고
 * 그 아래가 통째로 비었다 — 높이를 짐작하지 말고 남은 자리를 그대로 받게 한다.
 *
 * minHeight:0 이 없으면 flex 자식이 내용 높이 밑으로 줄지 않아 목록이 패널을 밀어낸다.
 */
export const pendingList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
})

/** 실패한 까닭. 성공 알림은 토스트로 지나가고 여기에는 실패만 남는다. */
export const errorNotice = style({
  margin: `${vars.space.sm} 0 0`,
  fontSize: vars.fontSize.sm,
  color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})`,
})

export const emptyState = style({
  padding: `${vars.space.xxxl} ${vars.space.lg}`,
  textAlign: 'center',
  color: vars.color.inkMuted,
  fontSize: vars.fontSize.sm,
})

/** 상세에서 목록으로 돌아가는 길. 페이지가 나뉘었으니 되돌아갈 문이 보여야 한다. */
export const backLink = style({
  display: 'inline-block',
  marginBottom: vars.space.sm,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  selectors: { '&:hover': { color: vars.color.accent } },
})
