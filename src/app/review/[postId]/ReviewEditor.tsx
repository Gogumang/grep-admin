'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { PostBody } from '@/components/preview/PostBody'
import type { PendingPost, PendingPostDetail, PendingPostEdit } from '@/lib/collector'
import * as body from '@/components/preview/postBody.css'
import * as console from '@/styles/console.css'
import * as styles from '../ReviewWorkbench.css'
import { publishPending, rejectPending, savePending } from '../actions'

/** 오른쪽에 보여주는 것. 검토는 "어떻게 나갈지"를 먼저 보는 일이라 미리보기가 기본이다. */
type Pane = 'preview' | 'edit'

/** 편집 중인 값. 서버에 보낼 때 원본과 달라진 것만 골라낸다. */
interface Draft {
  title: string
  summary: string
  tags: string
  sourceThumbnail: string
  body: string
}

function toDraft(post: PendingPost, postBody: string | null): Draft {
  return {
    title: post.title,
    summary: post.summary,
    tags: post.tags.join(', '),
    sourceThumbnail: post.sourceThumbnail ?? '',
    body: postBody ?? '',
  }
}

/**
 * 바뀐 항목만 추린다.
 *
 * 전부 보내면 안 고친 필드까지 커밋 diff에 올라와서, 나중에 "무엇을 손봤는지"를 볼 수 없다.
 */
function toEdit(draft: Draft, original: Draft): PendingPostEdit {
  const edit: PendingPostEdit = {}
  if (draft.title !== original.title) edit.title = draft.title
  if (draft.summary !== original.summary) edit.summary = draft.summary
  if (draft.tags !== original.tags) {
    edit.tags = draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }
  if (draft.sourceThumbnail !== original.sourceThumbnail) edit.sourceThumbnail = draft.sourceThumbnail
  if (draft.body !== original.body) edit.body = draft.body
  return edit
}

export function ReviewEditor({ detail }: { detail: PendingPostDetail }) {
  const router = useRouter()
  const loaded = toDraft(detail.post, detail.body)

  const [draft, setDraft] = useState<Draft>(loaded)
  const [original, setOriginal] = useState<Draft>(loaded)
  const [pane, setPane] = useState<Pane>('preview')
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const post = detail.post
  const dirty = Object.keys(toEdit(draft, original)).length > 0

  function run(action: () => Promise<{ ok: boolean; message: string }>, onDone?: () => void) {
    startTransition(async () => {
      const result = await action()
      setNotice(result)
      if (result.ok) onDone?.()
    })
  }

  /** 공개하거나 치우면 이 글은 대기 목록에서 사라진다 — 빈 화면에 남겨두지 않고 목록으로 돌려보낸다. */
  function backToList() {
    router.push('/review')
    router.refresh()
  }

  return (
    <>
      <a href="/review" className={styles.backLink}>
        ← 검토 목록
      </a>
      <h1 className={console.pageTitle}>{post.title}</h1>

      <div className={styles.panel}>
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tab} ${pane === 'preview' ? styles.tabActive : ''}`}
            onClick={() => setPane('preview')}
          >
            미리보기
          </button>
          <button
            type="button"
            className={`${styles.tab} ${pane === 'edit' ? styles.tabActive : ''}`}
            onClick={() => setPane('edit')}
          >
            편집{dirty ? ' •' : ''}
          </button>

          <span className={styles.tabSpacer} />

          <button
            type="button"
            className={styles.quietButton}
            disabled={!dirty || isPending}
            onClick={() => run(() => savePending(post.id, toEdit(draft, original)), () => setOriginal(draft))}
          >
            {dirty ? '저장' : '고친 내용 없음'}
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            disabled={isPending}
            onClick={() => run(() => rejectPending([post.id]), backToList)}
          >
            치우기
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={isPending}
            onClick={() => run(() => publishPending([post.id]), backToList)}
          >
            이 글 공개
          </button>
        </div>

        {pane === 'preview' ? (
          // 사이트와 같은 렌더러·같은 스타일·같은 줄 폭이라 실제와 갈라지지 않는다.
          <div className={styles.articlePreview}>
            <p className={styles.previewLabel}>목록에서</p>
            <div className={styles.cardPreview}>
              {draft.sourceThumbnail ? (
                <img className={styles.cardThumbnail} src={draft.sourceThumbnail} alt="" />
              ) : (
                <div className={styles.cardThumbnail} />
              )}
              <div>
                <p className={styles.cardTitle}>{draft.title}</p>
                <p className={styles.cardSummary}>{draft.summary}</p>
              </div>
            </div>

            <hr className={styles.previewDivider} />

            <p className={styles.previewLabel}>글 페이지에서</p>
            <h1 className={body.title}>{draft.title}</h1>
            <p className={body.byline}>
              <span className={body.bylineSource}>{post.blogName}</span>
            </p>
            <p className={body.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className={body.body}>
              {draft.body ? <PostBody body={draft.body} /> : <p className={body.missingBody}>본문이 없습니다.</p>}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.field}>
              <label className={styles.label}>제목</label>
              <input
                className={styles.input}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>요약 (목록 카드에 나가는 글)</label>
              <textarea
                className={styles.textarea}
                value={draft.summary}
                onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>태그 (쉼표로 구분)</label>
              <input
                className={styles.input}
                value={draft.tags}
                onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>썸네일 주소</label>
              <input
                className={styles.input}
                value={draft.sourceThumbnail}
                onChange={(event) => setDraft({ ...draft, sourceThumbnail: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>본문 (마크다운)</label>
              <textarea
                className={styles.bodyEditor}
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
              />
            </div>
          </>
        )}

        {notice && <p className={notice.ok ? styles.notice : styles.errorNotice}>{notice.message}</p>}
      </div>
    </>
  )
}
