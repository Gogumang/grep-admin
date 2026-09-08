'use client'

import { Children, type ReactElement, type ReactNode, cloneElement, isValidElement } from 'react'
import * as styles from './Tab.css'

export type TabSize = 'large' | 'small'

export interface TabItemProps {
  selected: boolean
  redBean?: boolean
  /** onChange의 두 번째 인자로 되돌아오는 값. 순서가 바뀌어도 어떤 탭인지 알 수 있다. */
  itemKey?: string | number
  children?: ReactNode
}

interface TabProps {
  children: ReactNode
  onChange: (index: number, key?: string | number) => void
  size?: TabSize
  fluid?: boolean
  itemGap?: number
  ariaLabel?: string
}

// Tab이 자식에게 몰래 넣어 주는 것들. 호출부가 직접 넘기는 값이 아니다.
interface InjectedProps {
  __size: TabSize
  __onSelect: () => void
}

/**
 * TDS Mobile의 Tab을 본뜬 것. 선택 상태는 TDS와 같이 바깥이 쥔다 —
 * Tab.Item마다 selected를 주고, 바뀌면 onChange로 알려 준다.
 *
 * TDS의 key prop은 itemKey로 이름을 바꿨다. React가 key를 예약해 자식 컴포넌트가 읽을 수
 * 없기 때문이다 — 같은 이름으로 두면 넘긴 값이 조용히 사라진다.
 */
export function Tab({ children, onChange, size = 'large', fluid = false, itemGap, ariaLabel }: TabProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[styles.list, fluid ? styles.fluid.true : styles.fluid.false].join(' ')}
      style={itemGap === undefined ? undefined : { gap: itemGap }}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement<TabItemProps>(child)) return child
        return cloneElement(child as ReactElement<TabItemProps & InjectedProps>, {
          __size: size,
          __onSelect: () => onChange(index, child.props.itemKey),
        })
      })}
    </div>
  )
}

Tab.Item = function TabItem({
  selected,
  redBean = false,
  children,
  ...injected
}: TabItemProps & Partial<InjectedProps>) {
  const { __size = 'large', __onSelect } = injected

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={[styles.item, styles.size[__size]].join(' ')}
      onClick={__onSelect}
    >
      <span className={styles.itemLabel}>
        {children}
        {/* 색만으로 알리는 표시라 소리로도 읽히게 남긴다. */}
        {redBean && <span className={styles.redBean} aria-label="새 항목 있음" role="img" />}
      </span>
    </button>
  )
}
