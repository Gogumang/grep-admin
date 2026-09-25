'use client'

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import * as styles from './FilterSelect.css'

export interface FilterSelectOption {
  value: string
  label: string
}

export interface FilterSelectProps {
  /** 칩과 팝오버 제목에 함께 쓰는 필터 이름 (예: "회사"). */
  label: string
  options: FilterSelectOption[]
  /** 고른 값. null이면 좁히지 않은 상태다. */
  value: string | null
  onChange: (value: string | null) => void
  /** 맨 위에 "전체"(null) 줄을 둘지. 늘 하나를 골라 둬야 하는 필터(회사 저장소 등)는 끈다. 기본 true. */
  hasAllOption?: boolean
}

/** 목록 맨 위의 "전체" 줄. 초기화 버튼이 없으니 좁힌 것을 푸는 길은 이 줄뿐이다 (hasAllOption). */
const ALL_LABEL = '전체'

/**
 * 필터 칩 + 팝오버 단일 선택. 토스증권 스크리너(tossinvest.com/screener)의 필터를 본떴다 —
 * TDS Mobile 문서에는 이런 컴포넌트가 없어 prop 이름은 어드민에 맞게 새로 지었다.
 *
 * 원본은 고른 뒤 "보기"를 눌러야 적용되지만, 여기서는 누르는 즉시 적용하고 닫는다.
 * 한 가지만 고르는 필터라 확인 단계가 클릭만 한 번 늘린다.
 *
 * 네이티브 <select>를 쓰지 않은 이유: 펼친 목록의 모양을 CSS로 바꿀 수 없어 OS 메뉴가 그대로 뜬다.
 * 대신 listbox 역할과 방향키 이동을 직접 붙였다.
 */
export function FilterSelect({ label, options, value, onChange, hasAllOption = true }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const baseId = useId()

  // "전체"(null)를 두면 0번 줄이고 나머지는 한 칸씩 밀린다.
  const rows: { value: string | null; label: string }[] = hasAllOption
    ? [{ value: null, label: ALL_LABEL }, ...options]
    : options
  const selectedOption = options.find((option) => option.value === value)

  function open() {
    setHighlightedIndex(Math.max(rows.findIndex((row) => row.value === value), 0))
    setIsOpen(true)
  }

  function close({ restoreFocus }: { restoreFocus: boolean }) {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  function select(next: string | null) {
    if (next !== value) onChange(next)
    close({ restoreFocus: true })
  }

  useEffect(() => {
    if (!isOpen) return
    listRef.current?.focus()
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [isOpen])

  // 방향키로 옮긴 줄이 스크롤 밖에 있으면 끌어온다.
  useEffect(() => {
    if (!isOpen) return
    document.getElementById(`${baseId}-option-${highlightedIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, highlightedIndex, baseId])

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const lastIndex = rows.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex((index) => Math.min(index + 1, lastIndex))
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex((index) => Math.max(index - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setHighlightedIndex(0)
        break
      case 'End':
        event.preventDefault()
        setHighlightedIndex(lastIndex)
        break
      case 'Enter':
      case ' ': {
        event.preventDefault()
        const highlighted = rows[highlightedIndex]
        if (highlighted) select(highlighted.value)
        break
      }
    }
  }

  const listId = `${baseId}-list`

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.stopPropagation()
          close({ restoreFocus: true })
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        data-active={selectedOption ? true : undefined}
        onClick={() => (isOpen ? close({ restoreFocus: false }) : open())}
      >
        {selectedOption ? `${label} · ${selectedOption.label}` : label}
        <ChevronIcon />
      </button>

      {isOpen && (
        <div className={styles.popover}>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={0}
            aria-label={label}
            aria-activedescendant={`${baseId}-option-${highlightedIndex}`}
            className={styles.list}
            onKeyDown={handleListKeyDown}
          >
            {rows.map((row, index) => {
              const isSelected = row.value === value
              return (
                <li
                  key={row.value ?? ''}
                  id={`${baseId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  data-highlighted={index === highlightedIndex ? true : undefined}
                  className={styles.option}
                  onPointerEnter={() => setHighlightedIndex(index)}
                  onClick={() => select(row.value)}
                >
                  <span className={styles.check}>{isSelected && <CheckIcon />}</span>
                  <span className={styles.optionLabel}>{row.label}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
