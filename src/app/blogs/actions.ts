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
export async function addBlog(blogName: string, feedUrl: string): Promise<ActionResult> {
  await requireAdmin()

  try {
    const feed = await collector.addBlog(blogName.trim(), feedUrl.trim())
    revalidatePath('/blogs')
    return { ok: true, message: `${feed.blogName} 추가됨` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/**
 * 수집을 켜거나 끈다.
 *
 * 목록에서 빼는 길을 두지 않은 이유 — 뺐다가 다시 넣으면 collector가 피드 주소로 blogKey를
 * 새로 만들고, 그 블로그로 모아둔 지난 글들이 주인을 잃는다. 멈추고 싶을 뿐이라면 끄면 된다.
 */
export async function setBlogActive(blogKey: string, active: boolean): Promise<ActionResult> {
  await requireAdmin()

  try {
    const feed = await collector.setBlogActive(blogKey, active)
    revalidatePath('/blogs')
    return { ok: true, message: `${feed.blogName} 수집 ${feed.active ? '켬' : '끔'}` }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}
