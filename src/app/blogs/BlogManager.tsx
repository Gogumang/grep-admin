'use client'

import { type RefObject, useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import { Button, Switch, TextField, useDialog, useToast } from '@/shared'
import type { BlogFeed } from '@/lib/collector'
import { SiteImage } from '@/components/SiteImage'
import type { SiteImage as SiteImageSource } from '@/lib/site'
import { addBlog, setBlogActive, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'
import * as local from './blogManager.css'

interface BlogDraft {
  blogName: string
  feedUrl: string
}

/**
 * 추가 창의 확인 버튼은 창 바깥(OverlayProvider)이 그린다.
 * 그래서 값을 읽고 실패를 돌려줄 통로를 창 안쪽에서 이 모양으로 남긴다.
 */
interface AddBlogControl {
  read: () => BlogDraft
  showError: (message: string) => void
}

/**
 * 추가 창 안의 입력 두 칸.
 *
 * 입력값을 state가 아니라 ref에 담는 이유 — 한 글자마다 다시 그리면 다이얼로그 전체가
 * 함께 다시 그려진다. 여기서 값을 읽는 곳은 확인 버튼 하나뿐이라 중간 상태가 필요 없다.
 */
function AddBlogFields({ control }: { control: RefObject<AddBlogControl | null> }) {
  const draft = useRef<BlogDraft>({ blogName: '', feedUrl: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    control.current = { read: () => draft.current, showError: setError }
    return () => {
      control.current = null
    }
  }, [control])

  return (
    <div className={local.fieldStack}>
      <TextField
        variant="box"
        label="블로그 이름"
        labelOption="sustain"
        placeholder="예: 카카오"
        autoFocus
        onChange={(event) => {
          draft.current = { ...draft.current, blogName: event.target.value }
        }}
      />
      <TextField
        variant="box"
        label="피드 주소"
        labelOption="sustain"
        placeholder="예: https://tech.kakao.com/feed/"
        onChange={(event) => {
          draft.current = { ...draft.current, feedUrl: event.target.value }
        }}
      />
      {error && <p className={local.fieldError}>{error}</p>}
    </div>
  )
}

/** 목록에서 회사를 알아보게 하는 아이콘 크기. 글자 한 줄 높이에 맞춘다. */
const BLOG_ICON_SIZE = 20

/**
 * 블로그 옆에 붙일 회사 아이콘 주소.
 *
 * 사이트 루트의 favicon.ico를 먼저 받고, 없으면 구글 파비콘 서비스로 물러난다 —
 * 아이콘을 <link rel="icon">으로만 알리고 루트에 두지 않는 곳이 있다.
 * 홈페이지 주소가 깨져 있으면 아이콘 없이 회색 자리만 남긴다.
 */
function blogIcon(homepageUrl: string): SiteImageSource | null {
  try {
    const { origin, hostname } = new URL(homepageUrl)
    return {
      url: `${origin}/favicon.ico`,
      fallbackUrl: `https://www.google.com/s2/favicons?domain=${hostname}&sz=${BLOG_ICON_SIZE * 2}`,
    }
  } catch {
    return null
  }
}

export function BlogManager({ feeds }: { feeds: BlogFeed[] }) {
  const { openToast } = useToast()
  const { openAsyncConfirm } = useDialog()
  /**
   * 실패한 결과만 담는다. 성공은 토스트로 흘려보내고, 실패는 화면에 남긴다 —
   * 무엇이 잘못됐는지는 고칠 때까지 보여야 한다.
   */
  const [failure, setFailure] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const addControl = useRef<AddBlogControl | null>(null)

  /**
   * 스위치를 서버 응답보다 먼저 움직인다. collector는 GitHub·DB를 거쳐 응답이 수백 ms라,
   * 누른 자리가 그동안 가만히 있으면 안 눌린 줄 알고 한 번 더 누른다.
   * 서버가 거절하면 revalidate 된 원래 값으로 알아서 돌아온다.
   */
  const [shownFeeds, applyOptimisticActive] = useOptimistic(
    feeds,
    (current, changed: { blogKey: string; active: boolean }) =>
      current.map((feed) => (feed.blogKey === changed.blogKey ? { ...feed, active: changed.active } : feed)),
  )

  /** 성공은 토스트, 실패는 화면. 두 군데가 같은 규칙을 쓰므로 한곳에 모은다. */
  function report(outcome: ActionResult): boolean {
    if (outcome.ok) {
      openToast(outcome.message)
      setFailure(null)
      return true
    }
    setFailure(outcome)
    return false
  }

  function openAddDialog() {
    void openAsyncConfirm({
      title: '블로그 추가',
      description: <AddBlogFields control={addControl} />,
      confirmButton: '추가',
      closeOnDimmerClick: true,
      onConfirmClick: async () => {
        const draft = addControl.current?.read() ?? { blogName: '', feedUrl: '' }
        const outcome = await addBlog(draft.blogName, draft.feedUrl)

        // 실패를 던지면 창이 닫히지 않는다. 방금 친 값을 남겨 둔 채 그 자리에서 알린다.
        if (!outcome.ok) {
          addControl.current?.showError(outcome.message)
          throw new Error(outcome.message)
        }

        report(outcome)
      },
    })
  }

  function toggleActive(feed: BlogFeed, active: boolean) {
    startTransition(async () => {
      applyOptimisticActive({ blogKey: feed.blogKey, active })
      report(await setBlogActive(feed.blogKey, active))
    })
  }

  return (
    <>
      {failure && <p className={styles.errorNotice}>{failure.message}</p>}

      <div className={styles.formRow}>
        <Button color="primary" variant="weak" size="small" onClick={openAddDialog}>
          추가
        </Button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHead}>블로그</th>
              <th className={styles.tableHead}>피드 주소</th>
              <th className={`${styles.tableHead} ${local.switchCell}`}>수집</th>
            </tr>
          </thead>
          <tbody>
            {shownFeeds.map((feed) => (
              <tr key={feed.blogKey} className={feed.active ? undefined : local.inactiveRow}>
                <td className={styles.tableCell}>
                  <span className={local.blogName}>
                    <SiteImage
                      source={blogIcon(feed.homepageUrl)}
                      className={local.blogIcon}
                      width={BLOG_ICON_SIZE}
                      height={BLOG_ICON_SIZE}
                    />
                    {feed.blogName}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.truncatedUrl}>{feed.feedUrl}</span>
                </td>
                <td className={`${styles.tableCell} ${local.switchCell}`}>
                  <Switch
                    checked={feed.active}
                    // 도는 동안 잠근다 — 연달아 누르면 늦게 도착한 요청이 뒤집어 놓는다.
                    disabled={isPending}
                    aria-label={`${feed.blogName} 수집`}
                    title={feed.active ? '수집 중 — 끄면 다음 수집부터 빠집니다' : '꺼둠 — 켜면 다음 수집부터 들어옵니다'}
                    onChange={(_, checked) => toggleActive(feed, checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
