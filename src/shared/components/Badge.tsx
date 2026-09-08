import type { HTMLAttributes, ReactNode } from 'react'
import * as styles from './Badge.css'

export type BadgeColor = (typeof styles.BADGE_COLORS)[number]
export type BadgeVariant = 'fill' | 'weak'
export type BadgeSize = 'xsmall' | 'small' | 'medium' | 'large'

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  color?: BadgeColor
  variant?: BadgeVariant
  size?: BadgeSize
  children?: ReactNode
}

/**
 * TDS Mobile의 Badge를 본뜬 것. 색 이름(blue·teal·green·red·yellow·elephant)까지 문서와 같다.
 *
 * TDS 문서에는 기본값이 적혀 있지 않아 셋 다 명시해서 쓰는 것을 전제로 하지만,
 * 호출부가 매번 세 개를 적게 만들 이유가 없어 가장 조용한 조합을 기본으로 둔다.
 */
export function Badge({ color = 'elephant', variant = 'weak', size = 'small', children, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={[styles.base, styles.size[size], styles.skins[`${color}-${variant}`]].join(' ')}
    >
      {children}
    </span>
  )
}
