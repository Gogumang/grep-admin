'use server'

import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface StartResult {
  runId: string
  existingPostCount: number
  blogs: Array<{ blogKey: string; blogName: string }>
}

export interface FeedResult {
  blogKey: string
  blogName: string
  ok: boolean
  newPostCount: number
  skippedWithoutDate: number
  message: string
}

export interface CommitResult {
  ok: boolean
  committedPostCount: number
  message: string
}

/**
 * 수집 한 판을 연다.
 *
 * 블로그를 한꺼번에 돌리지 않고 목록만 받아오는 이유 — 화면이 블로그마다 결과를
 * 하나씩 보여줘야 어디서 막혔는지 보인다. 한 덩어리로 돌리면 1분 동안 아무것도
 * 모른 채 기다리게 된다.
 */
export async function startCollection(): Promise<StartResult> {
  await requireAdmin()

  const run = await collector.openCollectionRun()
  return {
    runId: run.runId,
    existingPostCount: run.existingPostCount,
    blogs: run.feeds.map((feed) => ({ blogKey: feed.blogKey, blogName: feed.blogName })),
  }
}

/** 블로그 하나를 수집한다. 실패해도 예외를 던지지 않는다 — 나머지가 계속 돌아야 한다. */
export async function collectOneFeed(runId: string, blogKey: string, blogName: string): Promise<FeedResult> {
  await requireAdmin()

  try {
    const outcome = await collector.collectFeed(runId, blogKey)
    const notes: string[] = []
    if (outcome.skippedWithoutDate > 0) notes.push(`날짜없음 ${outcome.skippedWithoutDate}`)
    if (outcome.skippedDuplicate > 0) notes.push(`중복 ${outcome.skippedDuplicate}`)

    return {
      blogKey,
      blogName: outcome.blogName,
      ok: true,
      newPostCount: outcome.newPostCount,
      skippedWithoutDate: outcome.skippedWithoutDate,
      message: notes.join(' · '),
    }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : (error as Error).message
    return { blogKey, blogName, ok: false, newPostCount: 0, skippedWithoutDate: 0, message }
  }
}

/**
 * 모은 글을 한 커밋으로 저장한다.
 *
 * 이 단계에서 글마다 썸네일을 그리고 원문 본문을 받아온다 — 새 글이 많으면
 * 몇 분 걸릴 수 있다. 화면에 그 사실을 알려야 사용자가 멈춘 줄 알지 않는다.
 */
export async function commitCollection(runId: string): Promise<CommitResult> {
  await requireAdmin()

  try {
    const result = await collector.commitCollectionRun(runId)
    return {
      ok: true,
      committedPostCount: result.committedPostCount,
      message:
        result.committedPostCount === 0
          ? '새 글이 없어 저장하지 않았습니다.'
          : `${result.committedPostCount}개 저장 — ${result.blogNames.join(', ')}`,
    }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : (error as Error).message
    return { ok: false, committedPostCount: 0, message }
  }
}
