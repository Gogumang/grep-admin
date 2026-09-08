import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 상세에서 목록으로 돌아가는 길. 페이지가 나뉘었으니 되돌아갈 문이 보여야 한다. */
export const backLink = style({
  display: 'inline-block',
  marginBottom: vars.space.sm,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  selectors: { '&:hover': { color: vars.color.accent } },
})

/**
 * 제목 · 숨김 배지 · 원문 링크가 한 줄에 앉는다.
 * 제목이 길면 줄을 접되, 배지가 제목에서 떨어지지 않게 링크만 뒤로 넘어간다.
 */
export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.space.md,
})

/** 원문으로 가는 길. 제목을 미리보기에 내줬으니 원문은 여기 하나로 남긴다. */
export const sourceLink = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  selectors: { '&:hover': { color: vars.color.accent } },
})

/** 미리보기 판. 검토 상세와 같이 화면 끝까지 내려가고 안쪽이 스크롤한다. */
export const panel = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  background: vars.color.surface,
  borderRadius: vars.radius.xl,
  boxShadow: `0 0 0 1px ${vars.color.border}`,
  padding: vars.space.lg,
})
