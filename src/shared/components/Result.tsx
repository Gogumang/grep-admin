import type { ReactNode } from 'react'
import { Button, type ButtonColor, type ButtonSize } from './Button'
import * as styles from './Result.css'

/**
 * TDS Mobile의 Result를 본뜬 결과 화면. 목록이 비었거나 일이 끝났을 때 그 사실을 한 덩어리로 알린다.
 *
 * TDS는 figure에 Asset(이미지·아이콘)을 넣지만 어드민에는 Asset이 없어 img를 그대로 받는다.
 * 제목은 TDS처럼 h5다 — 페이지 제목(h1) 아래에서 문서 개요를 흐트러뜨리지 않는다.
 */
export function Result({
  figure,
  title,
  description,
  button,
}: {
  figure?: ReactNode
  title?: ReactNode
  description?: ReactNode
  button?: ReactNode
}) {
  return (
    <div className={styles.root}>
      {figure && (
        <div className={styles.figure} aria-hidden="true">
          {figure}
        </div>
      )}
      {title && <h5 className={styles.title}>{title}</h5>}
      {description && <p className={styles.description}>{description}</p>}
      {button && <div className={styles.button}>{button}</div>}
    </div>
  )
}

function ResultButton({
  size = 'medium',
  color = 'primary',
  onClick,
  children,
}: {
  size?: ButtonSize
  color?: ButtonColor
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <Button size={size} color={color} variant="weak" onClick={onClick}>
      {children}
    </Button>
  )
}

Result.Button = ResultButton
