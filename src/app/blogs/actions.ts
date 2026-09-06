'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

/**
 * 블로그를 추가한다.
 *
 * 피드가 살아있는지 확인하는 일은 collector가 한다 — 어드민이 따로 검증하면
 * 같은 규칙이 두 곳에 생기고, 언젠가 한쪽만 바뀐다.
 */
export async function addBlog(formData: FormData): Promise<ActionResult> {
  await requireAdmin()

  const blogName = String(formData.get('blogName') ?? '').trim()
  const feedUrl = String(formData.get('feedUrl') ?? '').trim()

  try {
    const feed = await collector.addBlog(blogName, feedUrl)
    revalidatePath('/blogs')
    return { ok: true, message: `${feed.blogName} 추가됨` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

export async function removeBlog(blogKey: string): Promise<ActionResult> {
  await requireAdmin()

  try {
    const feed = await collector.removeBlog(blogKey)
    revalidatePath('/blogs')
    // 이미 수집된 글은 남는다. 목록에서 빼는 것과 지난 글을 지우는 것은 다른 일이다.
    return { ok: true, message: `${feed.blogName} 제거됨. 이미 수집된 글은 그대로 남습니다.` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}
