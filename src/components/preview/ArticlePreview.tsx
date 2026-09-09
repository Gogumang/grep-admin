'use client'

import { useEffect, useRef, useState } from 'react'
import * as body from './postBody.css'
import * as styles from './articlePreview.css'
import { PostBody } from './PostBody'
import { SiteImage } from '@/components/SiteImage'

/** 편집할 수 있는 값들. 미리보기에 그려지는 것과 같은 이름을 쓴다. */
export interface ArticleDraft {
  title: string
  summary: string
  sourceThumbnail: string
  tags: string
  body: string
}

/**
 * 내용에 맞춰 키가 자라는 입력칸.
 *
 * 고정 높이를 주면 미리보기와 줄 수가 달라져서, 고치는 동안 아래 글이 들썩인다.
 * 값이 바뀔 때마다 한 번 0으로 접었다 scrollHeight로 펴야 줄어드는 쪽도 따라온다.
 */
function GrowingField({
  value,
  onChange,
  className,
  ariaLabel,
  autoFocus = false,
  onBlur,
}: {
  value: string
  onChange: (next: string) => void
  className: string
  ariaLabel: string
  autoFocus?: boolean
  onBlur?: () => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.style.height = '0px'
    element.style.height = `${element.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      rows={1}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

/**
 * 이 글이 사이트에서 어떻게 보이는지. 목록 카드와 글 페이지를 함께 보여준다.
 *
 * 검토(공개 전)와 글 상세(공개 후)가 같은 컴포넌트를 쓴다 — 두 화면이 갈라지면
 * "검토에서 본 모습"과 "실제로 나간 모습"을 대조할 수 없게 된다.
 *
 * onChange를 주면 미리보기 글자를 그대로 눌러 고칠 수 있다. 편집 화면을 따로 두지 않는
 * 이유는 미리보기의 존재 이유와 같다 — 고치는 내내 나갈 모습을 보고 있어야 한다.
 * 주지 않으면 읽기 전용이다(공개된 글 상세).
 */
export function ArticlePreview({
  draft,
  blogName,
  publishedAt,
  onChange,
}: {
  draft: ArticleDraft
  blogName: string
  publishedAt: string
  onChange?: (patch: Partial<ArticleDraft>) => void
}) {
  /**
   * 본문만 "누르면 열리는" 방식이다.
   *
   * 제목·요약과 달리 본문은 렌더된 모습(소제목·목록·코드)과 마크다운 원문이 아주 다르다.
   * 원문을 늘 펼쳐 두면 미리보기가 아니라 편집기가 되고, 반대로 렌더된 글을 제자리에서
   * 고치게 하면 원문의 서식이 깨진다 — 고칠 때만 원문으로 바꾼다.
   */
  const [isEditingBody, setIsEditingBody] = useState(false)

  const isEditable = onChange !== undefined

  return (
    <div className={styles.pane}>
      <p className={styles.label}>목록에서</p>
      <div className={styles.card}>
        <SiteImage className={styles.cardThumbnail} thumbnail={draft.sourceThumbnail} />
        <div className={styles.cardText}>
          {onChange ? (
            <>
              <GrowingField
                className={`${styles.cardTitle} ${styles.bareField}`}
                value={draft.title}
                ariaLabel="제목"
                onChange={(title) => onChange({ title })}
              />
              <GrowingField
                className={`${styles.cardSummary} ${styles.bareField}`}
                value={draft.summary}
                ariaLabel="요약"
                onChange={(summary) => onChange({ summary })}
              />
            </>
          ) : (
            <>
              <p className={styles.cardTitle}>{draft.title}</p>
              <p className={styles.cardSummary}>{draft.summary}</p>
            </>
          )}
        </div>
      </div>

      {/* 글에 그려지지 않는 값이라 눌러서 고칠 글자가 없다 — 카드 아래 줄로 붙인다. */}
      {onChange && (
        <div className={styles.metaFields}>
          <label className={styles.metaRow}>
            <span className={styles.metaLabel}>썸네일 주소</span>
            <input
              className={styles.metaInput}
              value={draft.sourceThumbnail}
              onChange={(event) => onChange({ sourceThumbnail: event.target.value })}
            />
          </label>
          <label className={styles.metaRow}>
            <span className={styles.metaLabel}>태그</span>
            <input
              className={styles.metaInput}
              value={draft.tags}
              placeholder="쉼표로 구분"
              onChange={(event) => onChange({ tags: event.target.value })}
            />
          </label>
        </div>
      )}

      <hr className={styles.divider} />

      <p className={styles.label}>글 페이지에서</p>
      {onChange ? (
        <GrowingField
          className={`${body.title} ${styles.bareField}`}
          value={draft.title}
          ariaLabel="제목"
          onChange={(title) => onChange({ title })}
        />
      ) : (
        <h1 className={body.title}>{draft.title}</h1>
      )}
      <p className={body.byline}>
        <span className={body.bylineSource}>{blogName}</span>
      </p>
      <p className={body.publishedAt}>
        {new Date(publishedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className={body.body}>
        {onChange && isEditingBody ? (
          <GrowingField
            className={styles.bodySource}
            value={draft.body}
            ariaLabel="본문 (마크다운)"
            autoFocus
            onBlur={() => setIsEditingBody(false)}
            onChange={(next) => onChange({ body: next })}
          />
        ) : (
          <div
            className={isEditable ? styles.editableBlock : undefined}
            // 본문이 비어 있어도 누를 자리가 있어야 처음 글을 넣을 수 있다.
            onClick={isEditable ? () => setIsEditingBody(true) : undefined}
            title={isEditable ? '누르면 마크다운 원문을 고칩니다' : undefined}
          >
            {draft.body ? <PostBody body={draft.body} /> : <p className={body.missingBody}>본문이 없습니다.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
