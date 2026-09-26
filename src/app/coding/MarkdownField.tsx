'use client'

import { useId } from 'react'
import { PostBody } from '@/components/preview/PostBody'
import * as postBody from '@/components/preview/postBody.css'
import * as shared from '@/components/shared.css'
import * as styles from './coding.css'

/**
 * 마크다운 원문과 미리보기를 나란히 둔 칸. 지문·입력 형식·출력 형식이 쓴다.
 *
 * 미리보기는 글 검토와 같은 PostBody 다 — 사이트도 지문을 같은 플러그인(GFM·코드 하이라이트)으로 그린다.
 * 표나 코드 블록이 깨진 채 공개되는 것을 적는 동안 바로 본다.
 */
export function MarkdownField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}) {
  const id = useId()

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label} (마크다운)
      </label>
      <div className={styles.markdownPair}>
        <textarea
          id={id}
          className={`${shared.input} ${styles.markdownSource}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className={styles.markdownPreview} aria-label={`${label} 미리보기`}>
          {value.trim() ? (
            <div className={postBody.body}>
              <PostBody body={value} />
            </div>
          ) : (
            <p className={styles.emptyPreview}>적으면 여기에 사이트에서 보일 모습이 나옵니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
