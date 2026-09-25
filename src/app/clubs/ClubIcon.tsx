'use client'

import { useState } from 'react'
import * as styles from './clubs.css'

/**
 * 동아리 아이콘. scripts/fetch-club-icons.py 가 받아 public/club-icons 에 둔 것이다.
 * 받지 못한 곳(화면을 스크립트로 그리는 사이트, 인스타그램 공지만 있는 곳)은 이름 첫 글자로 대신한다 —
 * 파일이 있는지 서버에서 미리 알 수 없어(정적 파일은 함수 번들에 없다) 불러오다 실패하면 바꾼다.
 */
export function ClubIcon({ clubKey, name, size }: { clubKey: string; name: string; size: number }) {
  const [hasFailed, setHasFailed] = useState(false)

  if (hasFailed) {
    return (
      <span className={styles.initial} style={{ width: size, height: size }} aria-hidden="true">
        {name.slice(0, 1)}
      </span>
    )
  }
  return (
    <img
      className={styles.icon}
      src={`/club-icons/${encodeURIComponent(clubKey)}.png`}
      alt=""
      width={size}
      height={size}
      onError={() => setHasFailed(true)}
    />
  )
}
