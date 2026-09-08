'use client'

import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
  useState,
} from 'react'
import * as styles from './TextField.css'

export type TextFieldVariant = 'box' | 'line' | 'big' | 'hero'
export type TextFieldLabelOption = 'appear' | 'sustain'

/** 보이는 값과 실제 값을 가르는 규칙. transform은 화면용, reset은 그 반대다. */
export interface TextFieldFormat {
  transform: (value: string) => string
  reset?: (formattedValue: string) => string
}

interface PublicProps {
  disabled?: boolean
  prefix?: string
  suffix?: string
  right?: ReactNode
  placeholder?: string
  format?: TextFieldFormat
}

export interface TextFieldProps
  extends PublicProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size' | 'className' | 'style'> {
  variant: TextFieldVariant
  label?: string
  labelOption?: TextFieldLabelOption
  help?: ReactNode
  hasError?: boolean
}

/**
 * TDS Mobile TextField를 본뜬 입력. prop 이름·허용값·기본값을 문서에 맞췄다.
 *
 * labelOption이 라벨의 성격을 가른다:
 *   appear  — 값이 없을 때는 placeholder가 라벨 노릇을 하고, 값이 들어오면 라벨이 떠오른다
 *   sustain — 라벨이 항상 위에 남는다 (어드민 폼에는 이쪽이 맞는 경우가 많다)
 *
 * format을 주면 화면에는 transform한 값이 보이고, onChange의 event.target.value에는
 * reset을 거친 원래 값이 담긴다. reset이 없으면 보이는 값이 그대로 전달된다 —
 * 이 경우 포맷 문자가 값에 섞이므로, 저장하는 입력에는 reset을 반드시 함께 준다.
 */
export function TextField({
  variant,
  label,
  labelOption = 'appear',
  help,
  hasError = false,
  disabled = false,
  prefix,
  suffix,
  right,
  placeholder,
  format,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  id,
  ...rest
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helpId = `${inputId}-help`

  const [isFocused, setIsFocused] = useState(false)
  // 값 유무만 알면 되는데 controlled/uncontrolled를 둘 다 받아야 해서, 스스로도 마지막
  // 입력을 기억한다. 라벨이 떠오를지 판단하는 데만 쓰고 입력값의 정본으로 삼지 않는다.
  const [typed, setTyped] = useState(String(defaultValue ?? ''))

  const currentValue = value !== undefined ? String(value) : typed
  const hasValue = currentValue.length > 0
  const shown = format ? format.transform(currentValue) : currentValue

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = format?.reset ? format.reset(event.target.value) : event.target.value
    setTyped(raw)
    if (!onChange) return
    // 화면에 보이는 값이 아니라 원래 값을 넘긴다. target을 새로 만들지 않고 값만 바꾸는 이유는
    // 호출부가 event.target.name 같은 다른 필드도 함께 읽기 때문이다.
    event.target.value = raw
    onChange(event)
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setIsFocused(true)
    onFocus?.(event)
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setIsFocused(false)
    onBlur?.(event)
  }

  const showLabel = label !== undefined && (labelOption === 'sustain' || hasValue || isFocused)

  return (
    <div className={styles.root}>
      {label !== undefined &&
        (labelOption === 'sustain' ? (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        ) : (
          <label htmlFor={inputId} className={styles.labelAppear} data-visible={showLabel || undefined}>
            {label}
          </label>
        ))}

      <div
        className={[styles.field, styles.variant[variant], hasError ? styles.hasError : ''].join(' ')}
        data-focused={isFocused || undefined}
        data-disabled={disabled || undefined}
      >
        {prefix && <span className={styles.affix}>{prefix}</span>}
        <input
          {...rest}
          id={inputId}
          className={[styles.input, styles.inputSize[variant]].join(' ')}
          disabled={disabled}
          // appear일 때는 라벨이 아직 안 보이므로 placeholder가 라벨을 대신해야 한다.
          placeholder={placeholder ?? (labelOption === 'appear' ? label : undefined)}
          value={value !== undefined || format ? shown : undefined}
          defaultValue={value === undefined && !format ? defaultValue : undefined}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={hasError || undefined}
          aria-describedby={help ? helpId : undefined}
        />
        {suffix && <span className={styles.affix}>{suffix}</span>}
        {right}
      </div>

      {help && (
        <p id={helpId} className={hasError ? styles.helpError : styles.help}>
          {help}
        </p>
      )}
    </div>
  )
}

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'style'> {
  label?: string
  help?: ReactNode
  hasError?: boolean
}

/**
 * 여러 줄 입력. TDS의 TextField.TextArea 자리다.
 *
 * variant를 받지 않는다 — 줄이 여러 개면 line·big·hero가 성립하지 않아 box 하나뿐이고,
 * 고를 수 없는 값을 prop으로 열어 두면 호출부가 있는 줄 알고 넘긴다.
 */
export function TextArea({ label, help, hasError = false, id, disabled, ...rest }: TextAreaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const helpId = `${textareaId}-help`
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={styles.root}>
      {label !== undefined && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}

      <div
        className={[styles.field, styles.variant.box, hasError ? styles.hasError : ''].join(' ')}
        data-focused={isFocused || undefined}
        data-disabled={disabled || undefined}
      >
        <textarea
          {...rest}
          id={textareaId}
          disabled={disabled}
          className={[styles.textarea, styles.inputSize.box].join(' ')}
          onFocus={(event) => {
            setIsFocused(true)
            rest.onFocus?.(event)
          }}
          onBlur={(event) => {
            setIsFocused(false)
            rest.onBlur?.(event)
          }}
          aria-invalid={hasError || undefined}
          aria-describedby={help ? helpId : undefined}
        />
      </div>

      {help && (
        <p id={helpId} className={hasError ? styles.helpError : styles.help}>
          {help}
        </p>
      )}
    </div>
  )
}
