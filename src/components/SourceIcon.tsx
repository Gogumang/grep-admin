'use client'

import { useState } from 'react'
import * as clubStyles from '../app/clubs/clubs.css'

/**
 * 수집처 아이콘. 스크립트(scripts/fetch-*-source-icons.py)가 받아 public/<iconDirectory>/<key>.png 에 둔 것이다.
 * 새로 더한 수집처라 아직 받지 않았거나 불러오기에 실패하면 채용 수집처처럼 이름 첫 글자로 대신한다.
 */
export function SourceIcon({
  iconDirectory,
  sourceKey,
  name,
  size,
}: {
  /** public 아래 폴더. 행사는 event-source-icons, 코딩테스트는 coding-source-icons. */
  iconDirectory: string
  sourceKey: string
  name: string
  size: number
}) {
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
      src={`/${iconDirectory}/${encodeURIComponent(sourceKey)}.png`}
      alt=""
      width={size}
      height={size}
      onError={() => setHasFailed(true)}
    />
  )
}
