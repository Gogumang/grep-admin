'use client'

import type { ChangeEvent, InputHTMLAttributes } from 'react'
import * as styles from './Checkbox.css'

export type CheckboxInputType = 'checkbox' | 'radio'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange' | 'className' | 'style'> {
  inputType?: CheckboxInputType
  /** 한 변의 픽셀 길이. TDS와 같은 기본값 24다. */
  size?: number
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" width="70%" height="70%" fill="none" aria-hidden="true">
      <path
        d="M5.5 12.5L10 17L18.5 8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Mark({ shape, inputType }: { shape: 'circle' | 'line'; inputType: CheckboxInputType }) {
  const className = shape === 'circle' ? styles.circle : styles.line
  // 라디오는 켜졌을 때 점이 보여야 하는데, 점은 배경과 같은 색이면 안 보인다.
  // circle 라디오만 점을 쓰고 나머지는 체크 표시를 그대로 쓴다.
  const content = inputType === 'radio' && shape === 'circle' ? <span className={styles.radioDot} /> : <CheckMark />
  return <span className={className}>{content}</span>
}

function make(shape: 'circle' | 'line') {
  return function CheckboxShape({
    inputType = 'checkbox',
    size = 24,
    onCheckedChange,
    disabled,
    ...rest
  }: CheckboxProps) {
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      onCheckedChange?.(event.target.checked)
    }

    return (
      <span className={styles.root} style={{ width: size, height: size }} data-disabled={disabled || undefined}>
        <input {...rest} type={inputType} className={styles.input} disabled={disabled} onChange={handleChange} />
        <Mark shape={shape} inputType={inputType} />
      </span>
    )
  }
}

/**
 * TDS Mobile Checkbox를 본뜬 것. TDS처럼 단독 export가 아니라 모양별 하위 컴포넌트로만 쓴다 —
 * `Checkbox.Circle` / `Checkbox.Line`.
 *
 * checked를 주면 제어 컴포넌트가 되고 onCheckedChange로 값을 되받는다.
 * 주지 않으면 defaultChecked로 시작해 스스로 상태를 갖는다 (TDS와 같다).
 *
 * aria-label은 타입으로 강제하지 않지만, 글자 없는 네모라서 없으면 소리로 읽을 수 없다.
 * 라벨이 옆에 따로 있는 경우가 아니면 반드시 넘긴다.
 */
export const Checkbox = {
  Circle: make('circle'),
  Line: make('line'),
}
