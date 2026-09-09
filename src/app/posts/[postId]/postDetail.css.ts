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

/** 저장 줄. 미리보기 위에 붙어 "지금 고칠 수 있다"는 것과 저장 단추를 함께 보여준다. */
export const editBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  marginBottom: vars.space.md,
})

/**
 * 눌러서 고친다는 안내. 저장 단추만 두면 처음 온 사람은 글자를 눌러 고칠 수 있다는 것을 모른다 —
 * 검토 화면과 같은 문구를 쓴다.
 */
export const editHint = style({
  marginRight: 'auto',
  fontSize: vars.fontSize.xs,
  color: vars.color.inkFaint,
})

/** 실패한 까닭. 성공은 토스트로 지나가고 여기에는 실패만 남는다. */
export const failure = style({
  margin: `${vars.space.md} 0 0`,
  fontSize: vars.fontSize.sm,
  color: `color-mix(in oklab, ${vars.color.brand} 75%, ${vars.color.inkStrong})`,
})
