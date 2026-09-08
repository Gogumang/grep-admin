import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import * as styles from './ListRow.css'

export type ListRowBorder = 'indented' | 'none'
export type ListRowDisabledStyle = 'type1' | 'type2'
export type ListRowVerticalPadding = 'small' | 'medium' | 'large' | 'xlarge'
export type ListRowHorizontalPadding = 'small' | 'medium'
export type ListRowAlignment = 'top' | 'center'

interface CommonProps {
  border?: ListRowBorder
  disabled?: boolean
  disabledStyle?: ListRowDisabledStyle
  verticalPadding?: ListRowVerticalPadding
  horizontalPadding?: ListRowHorizontalPadding
  left?: ReactNode
  leftAlignment?: ListRowAlignment
  contents?: ReactNode
  right?: ReactNode
  rightAlignment?: ListRowAlignment
  withArrow?: boolean
  withTouchEffect?: boolean
}

type Props = CommonProps &
  (
    | ({ as?: 'div' } & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'>)
    | ({ as: 'a' } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'style'>)
    | ({ as: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'>)
  )

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" className={styles.arrow}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * TDS Mobile의 ListRow를 본뜬 목록 한 줄. 왼쪽(아이콘) · 가운데(내용) · 오른쪽(보조)의 세 칸이다.
 *
 * `as`는 TDS에 없는 우리 추가분이다. TDS는 목록 줄을 감싸는 링크를 바깥에서 씌우는데,
 * a 안에 a가 들어가는 자리가 생기기 쉽고 줄 전체가 눌리는 과녁이 되지 않는다.
 * 줄 자체를 a나 button으로 세울 수 있게 열어 둔다.
 *
 * withTouchEffect는 이름만 TDS를 따랐고 동작은 hover다 — 어드민은 마우스로 쓴다.
 */
export function ListRow({
  border = 'indented',
  disabled = false,
  disabledStyle = 'type1',
  verticalPadding = 'medium',
  horizontalPadding = 'medium',
  left,
  leftAlignment = 'center',
  contents,
  right,
  rightAlignment = 'center',
  withArrow = false,
  withTouchEffect = false,
  ...props
}: Props) {
  const isInteractive = props.as === 'a' || props.as === 'button'

  const className = [
    styles.root,
    styles.border[border],
    styles.verticalPadding[verticalPadding],
    styles.horizontalPadding[horizontalPadding],
    withTouchEffect ? styles.touchEffect : '',
    disabled ? styles.disabledStyle[disabledStyle] : '',
  ]
    .filter(Boolean)
    .join(' ')

  const body = (
    <>
      {/* 왼쪽 칸은 비어 있어도 자리를 지운다 — 빈 칸이 남으면 아이콘 없는 줄만 안으로 밀린다. */}
      {left ? <span className={[styles.side, styles.alignment[leftAlignment]].join(' ')}>{left}</span> : null}
      <span className={styles.alignment.center}>{contents}</span>
      {right || withArrow ? (
        <span className={[styles.side, styles.alignment[rightAlignment]].join(' ')}>
          {right}
          {withArrow && <Arrow />}
        </span>
      ) : null}
    </>
  )

  const shared = {
    className,
    'data-disabled': disabled || undefined,
    'data-interactive': isInteractive && !disabled ? true : undefined,
    style: { gridTemplateColumns: `${left ? 'auto' : ''} minmax(0, 1fr) ${right || withArrow ? 'auto' : ''}`.trim() },
  }

  if (props.as === 'a') {
    const { as: _as, ...rest } = props
    // 못 쓰는 줄은 링크에서 빼야 키보드 탭이 지나가지 않는다. a에는 disabled가 없다.
    return (
      <a {...rest} {...shared} href={disabled ? undefined : rest.href} aria-disabled={disabled || undefined}>
        {body}
      </a>
    )
  }

  if (props.as === 'button') {
    const { as: _as, type = 'button', ...rest } = props
    return (
      <button {...rest} {...shared} type={type} disabled={disabled}>
        {body}
      </button>
    )
  }

  const { as: _as, ...rest } = props
  return (
    <div {...rest} {...shared}>
      {body}
    </div>
  )
}

/**
 * 가운데 칸의 글자 묶음. 제목 한 줄 + 설명 한 줄이다.
 *
 * TDS의 `type="1RowTypeA"` 같은 이름은 그대로 옮기지 않았다. 문서가 각 type이 무엇을
 * 어떻게 그리는지 적어 두지 않아, 이름만 같고 결과가 다르면 진짜 TDS로 갈아탈 때
 * 조용히 어긋난다 — 같은 이름을 쓰는 것보다 다른 이름이 낫다.
 */
ListRow.Texts = function ListRowTexts({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <span className={styles.texts}>
      <span className={styles.title}>{title}</span>
      {description && <span className={styles.description}>{description}</span>}
    </span>
  )
}
