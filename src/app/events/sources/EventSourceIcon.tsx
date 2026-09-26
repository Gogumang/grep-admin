'use client'

import { useState } from 'react'
import * as clubStyles from '../../clubs/clubs.css'

/**
 * 행사 수집처(판매처) 아이콘. scripts/fetch-event-source-icons.py 가 받아 public/event-source-icons/<key>.png 에 둔 것이다.
 * 새로 더한 판매처라 아직 받지 않았거나 불러오기에 실패하면 채용 수집처처럼 이름 첫 글자로 대신한다.
 */
export function EventSourceIcon({ sourceKey, name, size }: { sourceKey: string; name: string; size: number }) {
  const [hasFailed, setHasFailed] = useState(false)

  if (hasFailed) {
    return (
      <span className={clubStyles.initial} style={{ width: size, height: size }} aria-hidden="true">
        {name.slice(0, 1)}
      </span>
    )
  }
  return (
    <img
      className={clubStyles.icon}
      src={`/event-source-icons/${encodeURIComponent(sourceKey)}.png`}
      alt=""
      width={size}
      height={size}
      onError={() => setHasFailed(true)}
    />
  )
}
