'use client'

import type { ChangeEvent, InputHTMLAttributes } from 'react'
import * as styles from './Switch.css'

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'className' | 'style' | 'size'> {
  checked?: boolean
  disabled?: boolean
  name?: string
  /** TDS와 같은 두 인자다 — 원본 이벤트와, 바뀐 뒤의 켜짐 여부. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

/**
 * TDS Mobile Switch를 본뜬 토글.
 *
 * TDS의 hasTouchEffect는 두지 않았다 — 손가락으로 눌렀을 때 퍼지는 터치 물결 효과라
 * 마우스로 쓰는 어드민에는 켤 일이 없다. 있으면 호출부가 의미를 짐작하게 만든다.
 *
 * role="switch"는 input[type=checkbox]에 얹는다. 체크박스로 읽히면 "선택함/선택 안 함"이 되는데,
 * 토글은 "켜짐/꺼짐"으로 읽혀야 뜻이 맞는다.
 */
export function Switch({ checked, disabled, onChange, ...rest }: SwitchProps) {
  return (
    <span className={styles.root} data-disabled={disabled || undefined}>
      <input
        {...rest}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event, event.target.checked)}
      />
      <span className={styles.track} />
      <span className={styles.thumb} />
    </span>
  )
}
