import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import * as styles from './TextButton.css'

export type TextButtonColor = 'primary' | 'danger' | 'neutral'
export type TextButtonSize = 'small' | 'medium' | 'large'

interface CommonProps {
  color?: TextButtonColor
  size?: TextButtonSize
  children?: ReactNode
}

type Props = CommonProps &
  (
    | ({ as?: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>)
    | ({ as: 'a' } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'>)
  )

/**
 * 면 없이 글자만 있는 버튼. TDS의 TextButton 자리다.
 *
 * Button과 달리 밑줄로 눌리는 곳임을 알린다 — 면이 없으면 hover 때 배경을 바꿀 데가 없고,
 * 색만 살짝 바꾸면 색약인 사용자에게는 아무 일도 일어나지 않는다.
 */
export function TextButton({ color = 'primary', size = 'medium', children, ...props }: Props) {
  const className = [styles.base, styles.size[size], styles.color[color]].join(' ')

  if (props.as === 'a') {
    const { as: _as, ...rest } = props
    return (
      <a {...rest} className={className}>
        {children}
      </a>
    )
  }

  const { as: _as, type = 'button', ...rest } = props
  return (
    <button {...rest} type={type} className={className}>
      {children}
    </button>
  )
}
