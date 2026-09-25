import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 회사로 좁히는 줄. 열두 곳이 넘으면 줄을 넘겨 쌓인다 — 가로로 밀어 숨기면 뒤쪽 회사를 못 찾는다. */
export const filterBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.xs,
  paddingBottom: vars.space.md,
})

export const companyFilter = style({ display: 'inline-flex', alignItems: 'center', gap: vars.space.sm })

export const companyFilterLabel = style({ fontSize: vars.fontSize.sm, color: vars.color.inkMuted })

/** 브라우저 기본 화살표를 지우고 같은 자리에 그린다 — 입력칸(shared.input)과 같은 테두리·높이로 맞춘다. */
export const companySelect = style({
  appearance: 'none',
  minWidth: 180,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  background: `${vars.color.surface} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 10px center`,
  color: vars.color.ink,
  padding: `7px 32px 7px ${vars.space.md}`,
  fontSize: vars.fontSize.sm,
  cursor: 'pointer',
  selectors: { '&:focus': { outline: 'none', borderColor: vars.color.accent } },
})

/** 고른 공고를 한꺼번에 처리하는 줄. 목록이 길어도 손이 닿게 목록 위에 둔다. */
export const actionBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  padding: `${vars.space.sm} 0`,
  marginBottom: vars.space.sm,
  borderTop: `1px solid ${vars.color.border}`,
  borderBottom: `1px solid ${vars.color.border}`,
})

export const selectAll = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.sm,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
  cursor: 'pointer',
})

/** 공고 상세의 회사·직군·마감 한 줄. 판단에 필요한 사실만 모아 제목 아래 둔다. */
export const detailMeta = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space.xs,
  margin: `0 0 ${vars.space.md}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.inkMuted,
})
