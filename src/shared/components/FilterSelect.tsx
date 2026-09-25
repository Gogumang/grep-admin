'use client'

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { Button } from './Button'
import * as styles from './FilterSelect.css'

export interface FilterSelectOption {
  value: string
  label: string
  /** 이 값으로 좁혔을 때 남는 건수. 있으면 이름 옆에 흐리게 붙는다. */
  count?: number
}

export interface FilterSelectProps {
  /** 칩과 팝오버 제목에 함께 쓰는 필터 이름 (예: "회사"). */
  label: string
  /** 제목 옆 보조 설명 (예: "공고 많은 순"). */
  description?: string
  options: FilterSelectOption[]
  /** 고른 값. null이면 좁히지 않은 상태다. */
  value: string | null
  onChange: (value: string | null) => void
}

/**
 * 필터 칩 + 팝오버 단일 선택. 토스증권 스크리너(tossinvest.com/screener)의 필터를 본떴다 —
 * TDS Mobile 문서에는 이런 컴포넌트가 없어 prop 이름은 어드민에 맞게 새로 지었다.
 *
 * 항목을 눌러도 바로 적용하지 않고 "보기"를 눌러야 적용한다. 원본과 같은 흐름이고,
 * 팝오버를 닫으면 고르던 것은 버려진다 — 목록이 눈앞에서 계속 바뀌지 않게 하려는 것이다.
 *
 * 네이티브 <select>를 쓰지 않은 이유: 펼친 목록의 모양을 CSS로 바꿀 수 없어 OS 메뉴가 그대로 뜬다.
 * 대신 listbox 역할과 방향키 이동을 직접 붙였다.
 */
export function FilterSelect({ label, description, options, value, onChange }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<string | null>(value)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const baseId = useId()

  const selectedOption = options.find((option) => option.value === value)

  function open() {
    setDraft(value)
    setHighlightedIndex(options.findIndex((option) => option.value === value))
    setIsOpen(true)
  }

  function close({ restoreFocus }: { restoreFocus: boolean }) {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  function commit(next: string | null) {
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
    if (!isOpen || highlightedIndex < 0) return
    document.getElementById(`${baseId}-option-${highlightedIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, highlightedIndex, baseId])

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const lastIndex = options.length - 1
    const highlighted = options[highlightedIndex]
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
      case ' ':
        event.preventDefault()
        if (highlighted) setDraft(highlighted.value)
        break
      case 'Enter':
        // 키보드로는 고르면서 바로 적용한다 — "보기"까지 탭으로 건너가는 길이 멀다.
        event.preventDefault()
        if (highlighted) commit(highlighted.value)
        break
    }
  }

  const listId = `${baseId}-list`
  const titleId = `${baseId}-title`

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
          <div className={styles.header}>
            <span id={titleId} className={styles.title}>
              {label}
            </span>
            {description && <span className={styles.description}>{description}</span>}
          </div>

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={0}
            aria-labelledby={titleId}
            aria-activedescendant={highlightedIndex >= 0 ? `${baseId}-option-${highlightedIndex}` : undefined}
            className={styles.list}
            onKeyDown={handleListKeyDown}
          >
            {options.map((option, index) => {
              const isSelected = option.value === draft
              return (
                <li
                  key={option.value}
                  id={`${baseId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  data-highlighted={index === highlightedIndex ? true : undefined}
                  className={styles.option}
                  onPointerEnter={() => setHighlightedIndex(index)}
                  onClick={() => setDraft(option.value)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.count !== undefined && <span className={styles.optionCount}>{option.count}</span>}
                  <span className={styles.check}>{isSelected && <CheckIcon />}</span>
                </li>
              )
            })}
          </ul>

          <div className={styles.footer}>
            <Button color="light" size="small" disabled={draft === null} onClick={() => setDraft(null)}>
              초기화
            </Button>
            <Button color="primary" size="small" disabled={draft === value} onClick={() => commit(draft)}>
              보기
            </Button>
          </div>
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
