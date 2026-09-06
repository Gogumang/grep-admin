'use client'

import { useState, useTransition } from 'react'
import { PostBody } from '@/components/preview/PostBody'
import type { PendingPost, PendingPostEdit } from '@/lib/collector'
import * as body from '@/components/preview/postBody.css'
import * as styles from './ReviewWorkbench.css'
import { loadPending, publishPending, rejectPending, savePending } from './actions'

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

export function ReviewWorkbench({ initialPending }: { initialPending: PendingPost[] }) {
  const [pending, setPending] = useState(initialPending)
  const [openPost, setOpenPost] = useState<PendingPost | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [original, setOriginal] = useState<Draft | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  async function open(post: PendingPost) {
    setOpenPost(post)
    setDraft(null)
    setNotice(null)

    const loaded = await loadPending(post.id)
    if ('error' in loaded) {
      setNotice({ ok: false, message: loaded.error })
      return
    }
    const next = toDraft(loaded.post, loaded.body)
    setDraft(next)
    setOriginal(next)
  }

  function toggle(postId: string) {
    setChecked((previous) => {
      const next = new Set(previous)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  function run(action: () => Promise<{ ok: boolean; message: string }>, onDone?: () => void) {
    startTransition(async () => {
      const result = await action()
      setNotice(result)
      if (result.ok) onDone?.()
    })
  }

  const dirty = draft !== null && original !== null && Object.keys(toEdit(draft, original)).length > 0
  const selected = [...checked]

  function removeFromList(ids: string[]) {
    setPending((previous) => previous.filter((post) => !ids.includes(post.id)))
    setChecked(new Set())
    if (openPost && ids.includes(openPost.id)) {
      setOpenPost(null)
      setDraft(null)
    }
  }

  if (pending.length === 0) {
    return (
      <div className={styles.panel}>
        <p className={styles.emptyState}>검토할 글이 없습니다. 수집이 돌면 여기에 쌓입니다.</p>
      </div>
    )
  }

  return (
    <div className={styles.workbench}>
      {/* 목록 — 체크는 일괄 처리용, 클릭은 펼치기용으로 나눈다 */}
      <div className={styles.panel}>
        <p className={styles.panelTitle}>대기 {pending.length}건</p>
        <div className={styles.pendingList}>
          {pending.map((post) => (
            <label
              key={post.id}
              className={`${styles.pendingRow} ${openPost?.id === post.id ? styles.pendingRowActive : ''}`}
            >
              <input type="checkbox" checked={checked.has(post.id)} onChange={() => toggle(post.id)} />
              <span onClick={() => open(post)}>
                <span className={styles.pendingTitle}>{post.title}</span>
                <span className={styles.pendingMeta}>
                  {post.blogName} · {post.publishedAt.slice(0, 10)}
                  {!post.hasBody && <span className={styles.warningBadge}>본문 없음</span>}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={selected.length === 0 || isPending}
            onClick={() => run(() => publishPending(selected), () => removeFromList(selected))}
          >
            {isPending ? '처리 중…' : `선택 ${selected.length}건 공개`}
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            disabled={selected.length === 0 || isPending}
            onClick={() => run(() => rejectPending(selected), () => removeFromList(selected))}
          >
            치우기
          </button>
        </div>
        {notice && <p className={notice.ok ? styles.notice : styles.errorNotice}>{notice.message}</p>}
      </div>

      {/* 편집 */}
      <div className={styles.panel}>
        <p className={styles.panelTitle}>편집</p>
        {!openPost && <p className={styles.emptyState}>왼쪽에서 글을 고르세요.</p>}
        {openPost && !draft && <p className={styles.emptyState}>불러오는 중…</p>}
        {draft && openPost && (
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
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.quietButton}
                disabled={!dirty || isPending}
                onClick={() =>
                  run(
                    () => savePending(openPost.id, toEdit(draft, original as Draft)),
                    () => setOriginal(draft),
                  )
                }
              >
                {dirty ? '저장' : '고친 내용 없음'}
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={isPending}
                onClick={() => run(() => publishPending([openPost.id]), () => removeFromList([openPost.id]))}
              >
                이 글 공개
              </button>
            </div>
          </>
        )}
      </div>

      {/* 미리보기 — 사이트와 같은 렌더러·같은 스타일이라 실제와 갈라지지 않는다 */}
      <div className={styles.panel}>
        <p className={styles.panelTitle}>미리보기</p>
        {!draft && <p className={styles.emptyState}>글을 고르면 여기에 보입니다.</p>}
        {draft && openPost && (
          <>
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
            <div className={body.body}>
              {draft.body ? <PostBody body={draft.body} /> : <p className={body.missingBody}>본문이 없습니다.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
