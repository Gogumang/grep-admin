import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/**
 * 미리보기 판. 검토 화면과 글 상세가 같은 것을 본다 —
 * "공개하기 전에 어떻게 보이나"와 "이미 나간 글이 어떻게 보이나"는 같은 질문이다.
 */

/**
 * postBody.css의 container는 700px 줄 폭을 위해 좌우 여백을 크게 잡는데,
 * 패널 안에서는 그 여백이 이중이 되므로 줄 폭만 가져오고 좌우는 패널에 맡긴다.
 */
export const pane = style({
  maxWidth: 700,
  margin: '0 auto',
})

/** 카드 미리보기와 글 페이지 미리보기를 가르는 이름표. */
export const label = style({
  margin: `0 0 ${vars.space.sm}`,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkFaint,
})

export const divider = style({
  margin: `${vars.space.xl} 0`,
  border: 0,
  borderTop: `1px solid ${vars.color.border}`,
})

/** 목록 화면에서 이 글이 어떻게 보일지. */
export const card = style({
  display: 'flex',
  gap: vars.space.md,
  padding: vars.space.md,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  marginBottom: vars.space.lg,
})

export const cardThumbnail = style({
  width: 120,
  height: 66,
  objectFit: 'cover',
  borderRadius: vars.radius.md,
  flexShrink: 0,
  background: vars.color.surfaceSunken,
})

export const cardTitle = style({
  margin: 0,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.inkStrong,
  lineHeight: 1.4,
})

export const cardSummary = style({
  margin: `${vars.space.xs} 0 0`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  lineHeight: 1.5,
})

/*
 * 여기부터는 편집용. 미리보기 글자를 그대로 눌러 고치는 자리다.
 *
 * 입력칸처럼 보이지 않게 하는 것이 핵심이다 — 테두리와 배경을 지우고 글자 모양만
 * 미리보기와 똑같이 맞춘다. 그래야 "지금 보는 것이 나갈 모습"이라는 미리보기의
 * 성질이 편집 중에도 유지된다. 손댈 수 있다는 신호는 hover·focus 때만 준다.
 */

/** 글자 모양을 바깥에서 물려받는 투명한 입력칸. 제목·요약·본문이 모두 이걸 쓴다. */
export const bareField = style({
  display: 'block',
  width: '100%',
  margin: 0,
  padding: vars.space.xs,
  border: 0,
  borderRadius: vars.radius.sm,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  letterSpacing: 'inherit',
  lineHeight: 'inherit',
  // 세로 스크롤바가 생기면 글이 밀려 미리보기와 폭이 달라진다 — 높이를 내용에 맞춘다.
  resize: 'none',
  overflow: 'hidden',
  selectors: {
    '&:hover': { background: vars.color.surfaceSunken },
    '&:focus': { outline: 'none', background: vars.color.surfaceSunken },
  },
})

/** 눌러서 고치는 자리라는 것을 hover 때만 알린다. 본문처럼 렌더된 덩어리에 씌운다. */
export const editableBlock = style({
  padding: vars.space.xs,
  borderRadius: vars.radius.sm,
  cursor: 'text',
  selectors: { '&:hover': { background: vars.color.surfaceSunken } },
})

/** 본문 원문. 미리보기 글자체가 아니라 마크다운을 읽는 글자체여야 한다. */
export const bodySource = style([
  bareField,
  {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: vars.fontSize.sm,
    lineHeight: 1.7,
  },
])

/**
 * 미리보기에 나오지 않는 값들 — 썸네일 주소와 태그.
 *
 * 글에 그려지지 않으니 눌러서 고칠 글자가 없다. 그렇다고 편집 탭을 따로 두면
 * 화면이 다시 둘로 갈라지므로, 카드 바로 아래 옅은 줄로 붙여 둔다.
 */
export const metaFields = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
  marginBottom: vars.space.lg,
})

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
})

export const metaLabel = style({
  flexShrink: 0,
  width: 72,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.inkFaint,
})

export const metaInput = style({
  flex: 1,
  minWidth: 0,
  padding: `${vars.space.xs} ${vars.space.sm}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  background: vars.color.canvas,
  color: vars.color.ink,
  fontSize: vars.fontSize.xs,
  fontFamily: 'inherit',
})

/** 카드의 글자 칸. 입력칸이 들어오면 flex 자식이 내용 폭 밑으로 줄지 않아 카드를 밀어낸다. */
export const cardText = style({
  flex: 1,
  minWidth: 0,
})
