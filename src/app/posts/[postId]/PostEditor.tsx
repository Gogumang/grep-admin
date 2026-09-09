'use client'

import { useState, useTransition } from 'react'
import { ArticlePreview, type ArticleDraft } from '@/components/preview/ArticlePreview'
import { Badge, Button, useToast } from '@/shared'
import type { PendingPostEdit, PostDetail } from '@/lib/collector'
import * as console from '@/styles/console.css'
import { savePost } from './actions'
import * as styles from './postDetail.css'

/** 화면이 들고 있는 값. 서버에 보낼 때 원본과 달라진 것만 골라낸다. */
function toDraft(detail: PostDetail): ArticleDraft {
  return {
    title: detail.post.title,
    summary: detail.post.summary,
    sourceThumbnail: detail.post.sourceThumbnail ?? '',
    tags: detail.post.tags.join(', '),
    body: detail.body ?? '',
  }
}

/**
 * 바뀐 항목만 추린다. 검토 화면(ReviewEditor)과 같은 규칙이다 —
 * 전부 보내면 안 고친 필드까지 커밋 diff에 올라와 무엇을 손봤는지 볼 수 없다.
 */
function toEdit(draft: ArticleDraft, original: ArticleDraft): PendingPostEdit {
  const edit: PendingPostEdit = {}
  if (draft.title !== original.title) edit.title = draft.title
  if (draft.summary !== original.summary) edit.summary = draft.summary
  if (draft.sourceThumbnail !== original.sourceThumbnail) edit.sourceThumbnail = draft.sourceThumbnail
  if (draft.body !== original.body) edit.body = draft.body
  if (draft.tags !== original.tags) {
    edit.tags = draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  return edit
}

/**
 * 이미 나간 글을 미리보며 고치는 화면.
 *
 * 검토 화면과 같은 ArticlePreview를 쓴다 — 고치는 방식이 화면마다 다르면 같은 일을 두 번
 * 배워야 한다. 다른 점은 여기가 '이미 나간 글'이라는 것뿐이고, 그 무게는 저장 문구
 * ("다음 배포부터 반영됩니다")와 숨김 배지가 말한다.
 */
export function PostEditor({ detail }: { detail: PostDetail }) {
  const loaded = toDraft(detail)
  const { openToast } = useToast()

  const [draft, setDraft] = useState<ArticleDraft>(loaded)
  const [original, setOriginal] = useState<ArticleDraft>(loaded)
  /** 실패만 화면에 남긴다. 저장됐다는 말은 토스트로 지나가도 되지만 실패는 고칠 때까지 보여야 한다. */
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const post = detail.post
  const dirty = Object.keys(toEdit(draft, original)).length > 0

  function save() {
    startTransition(async () => {
      const result = await savePost(post.id, toEdit(draft, original))
      if (!result.ok) {
        setFailure(result.message)
        return
      }
      setFailure(null)
      openToast(result.message)
      setOriginal(draft)
    })
  }

  return (
    <>
      <a href="/posts" className={styles.backLink}>
        ⬅️ 글 목록
      </a>
      <div className={styles.titleRow}>
        {/* 제목은 미리보기 안에서 고친다 — 여기 제목은 지금 보고 있는 글이 무엇인지 알리는 머리다. */}
        <h1 className={console.pageTitle}>{original.title}</h1>
        {post.hidden && (
          <Badge color="red" variant="weak" size="small">
            숨김
          </Badge>
        )}
        <a className={styles.sourceLink} href={post.url} target="_blank" rel="noopener noreferrer">
          원문 보기 ↗
        </a>
      </div>

      <div className={styles.editBar}>
        <span className={styles.editHint}>
          {dirty ? '고친 내용이 있습니다' : '미리보기의 글자를 눌러 고칩니다'}
        </span>
        <Button color="primary" variant="weak" size="small" disabled={!dirty || isPending} onClick={save}>
          {dirty ? '저장' : '고친 내용 없음'}
        </Button>
      </div>

      <div className={styles.panel}>
        <ArticlePreview
          draft={draft}
          blogName={post.blogName}
          publishedAt={post.publishedAt}
          onChange={(patch) => setDraft((previous) => ({ ...previous, ...patch }))}
        />
      </div>

      {failure && <p className={styles.failure}>{failure}</p>}
    </>
  )
}
