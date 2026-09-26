import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/** 추천 낱말은 정규식이라 칸 맞춤이 읽기를 돕는다. */
const MONOSPACE_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

export const nameInput = style({ width: 160 })

export const keywordsInput = style({ width: '100%', minWidth: 240, fontFamily: MONOSPACE_FONT, fontSize: vars.fontSize.xs })

export const countCell = style({ width: 56, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' })

export const actionsCell = style({ width: 170, whiteSpace: 'nowrap', textAlign: 'right' })

export const footer = style({ display: 'flex', justifyContent: 'space-between', marginTop: vars.space.lg })
