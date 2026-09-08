import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import * as styles from './Button.css'

export type ButtonColor = 'primary' | 'danger' | 'light' | 'dark'
export type ButtonVariant = 'fill' | 'weak'
export type ButtonDisplay = 'inline' | 'block' | 'full'
export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge'

interface CommonProps {
  color?: ButtonColor
  variant?: ButtonVariant
  display?: ButtonDisplay
  size?: ButtonSize
  loading?: boolean
  /** TDS와 이름을 맞춘 인라인 스타일 통로. className을 열지 않는 이유는 아래 주석 참조. */
  htmlStyle?: CSSProperties
  children?: ReactNode
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'style'> & { as?: 'button' }

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color' | 'style'> & { as: 'a' }

/**
 * TDS Mobile의 Button을 본떠 어드민 토큰으로 다시 그린 것이다.
 * prop 이름·허용값·기본값은 문서와 같게 맞췄다 — 나중에 진짜 @toss/tds-mobile로
 * 갈아탈 때 호출부를 고치지 않아도 되게 하려는 것이다.
 * (진짜 패키지를 못 쓰는 이유: peer가 React 18까지인데 이 저장소는 React 19다.)
 *
 * className 대신 htmlStyle만 여는 것도 TDS를 따른 것이다. 바깥에서 클래스를 덧대면
 * 컴포넌트가 정한 치수·색을 화면마다 다르게 덮어써 결국 공용 컴포넌트가 아니게 된다.
 *
 * size 기본값은 TDS 그대로 xlarge(56px)다. 모바일 CTA 치수이므로 어드민의 보통 버튼은
 * size="small" 또는 "medium"을 넘겨서 쓴다.
 */
export function Button(props: ButtonProps | AnchorProps) {
  const {
    color = 'primary',
    variant = 'fill',
    display = 'inline',
    size = 'xlarge',
    loading = false,
    htmlStyle,
    children,
    ...rest
  } = props

  const className = [
    styles.base,
    styles.size[size],
    styles.display[display],
    styles.skins[`${color}-${variant}`],
  ].join(' ')

  // 로딩 중에는 스피너가 글자를 대신한다. 글자를 남겨 두면 폭이 들썩이고,
  // 두 개를 같이 두면 버튼이 좁을 때 글자가 잘린다.
  const body = loading ? <span className={styles.spinner} aria-hidden="true" /> : children

  if (rest.as === 'a' || props.as === 'a') {
    const { as: _as, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' }
    return (
      <a
        {...anchorProps}
        className={className}
        style={htmlStyle}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
      >
        {body}
      </a>
    )
  }

  const { as: _as, disabled, type = 'button', ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button'
  }

  return (
    <button
      {...buttonProps}
      type={type}
      className={className}
      style={htmlStyle}
      // 로딩 중 클릭은 같은 요청을 두 번 보낸다. disabled로 막되 aria-busy로 이유를 알린다.
      disabled={disabled || loading}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
    >
      {body}
    </button>
  )
}
