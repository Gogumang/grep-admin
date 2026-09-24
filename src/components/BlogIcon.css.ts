import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/contract.css'

/**
 * 받지 못해도 같은 크기의 자리를 남겨 이름들의 시작점이 어긋나지 않게 한다.
 * 회색 바탕은 받지 못해 남은 자리(div)에만 깐다 — 투명한 파비콘 뒤에 깔면 아이콘마다 회색 테두리가 생긴다.
 */
export const blogIcon = style({
  flexShrink: 0,
  borderRadius: 4,
  objectFit: 'contain',
  selectors: {
    'div&': { backgroundColor: vars.color.surfaceSunken },
  },
})
