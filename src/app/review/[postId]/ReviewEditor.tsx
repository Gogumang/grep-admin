'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ArticlePreview, type ArticleDraft } from '@/components/preview/ArticlePreview'
import { Button, useToast } from '@/shared'
import type { PendingPost, PendingPostDetail, PendingPostEdit } from '@/lib/collector'
import * as console from '@/styles/console.css'
import * as styles from '../ReviewWorkbench.css'
import { publishPending, rejectPending, savePending } from '../actions'

function toDraft(post: PendingPost, postBody: string | null): ArticleDraft {
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
function toEdit(draft: ArticleDraft, original: ArticleDraft): PendingPostEdit {
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

/**
 * 글 하나를 검토하는 자리.
 *
 * 미리보기와 편집을 탭으로 나눠 두었는데 합쳤다 — 검토는 "이대로 나가도 되나"를 판단하는
 * 일이라 고치는 내내 나갈 모습이 보여야 한다. 탭을 오가면 고친 결과를 확인하려고 매번
 * 되돌아가야 했다. 이제 미리보기의 글자를 그대로 눌러 고친다.
 */
export function ReviewEditor({ detail }: { detail: PendingPostDetail }) {
  const router = useRouter()
  const loaded = toDraft(detail.post, detail.body)

  const [draft, setDraft] = useState<ArticleDraft>(loaded)
  const [original, setOriginal] = useState<ArticleDraft>(loaded)
  const { openToast } = useToast()
  /**
   * 실패만 화면에 남긴다. 저장됐다는 말은 흘려보내도 되지만, 실패는 고칠 때까지 보여야 한다 —
   * 특히 여기는 고친 내용이 아직 안 나간 상태라 알림이 사라지면 나갔다고 읽는다.
   */
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const post = detail.post
  const dirty = Object.keys(toEdit(draft, original)).length > 0

  function run(action: () => Promise<{ ok: boolean; message: string }>, onDone?: () => void) {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setFailure(result.message)
        return
      }
      setFailure(null)
      openToast(result.message)
      onDone?.()
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
        ⬅️ 검토 목록
      </a>
      <h1 className={console.pageTitle}>{post.title}</h1>

      <div className={styles.editorPanel}>
        <div className={styles.tabBar}>
          {/*
            탭을 없애면서 "고친 것이 있다"를 알리던 편집 탭의 점(•)도 함께 사라졌다.
            저장 버튼만 두면 처음 온 사람은 글자를 눌러 고칠 수 있다는 것을 모른다.
          */}
          <span className={styles.editHint}>
            {dirty ? '고친 내용이 있습니다' : '미리보기의 글자를 눌러 고칩니다'}
          </span>

          <span className={styles.tabSpacer} />

          <Button
            color="light"
            size="small"
            disabled={!dirty || isPending}
            onClick={() => run(() => savePending(post.id, toEdit(draft, original)), () => setOriginal(draft))}
          >
            {dirty ? '저장' : '고친 내용 없음'}
          </Button>
          <Button
            color="danger"
            variant="weak"
            size="small"
            disabled={isPending}
            onClick={() => run(() => rejectPending([post.id]), backToList)}
          >
            치우기
          </Button>
          {/* 여기서만 채운 버튼을 쓴다 — 이 화면의 목적이 '공개'라서 한 개는 도드라져야 한다. */}
          <Button
            color="primary"
            size="small"
            disabled={isPending}
            onClick={() => run(() => publishPending([post.id]), backToList)}
          >
            이 글 공개
          </Button>
        </div>

        <div className={styles.editorBody}>
          <ArticlePreview
            draft={draft}
            blogName={post.blogName}
            publishedAt={post.publishedAt}
            onChange={(patch) => setDraft((previous) => ({ ...previous, ...patch }))}
          />
        </div>

        {failure && <p className={styles.errorNotice}>{failure}</p>}
      </div>
    </>
  )
}
