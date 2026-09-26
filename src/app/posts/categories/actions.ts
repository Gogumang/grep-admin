'use server'

import { revalidatePath } from 'next/cache'
import { collector, CollectorRequestError, type PostCategoryChange, type PostCategoryItem } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface SaveCategoriesResult {
  ok: boolean
  message: string
  /** 저장한 뒤의 목록. 화면이 이것으로 다시 그린다. */
  categories?: PostCategoryItem[]
}

/**
 * 분류 목록을 통째로 저장한다. collector 가 사이트(categories.json·이름 바뀐 글 파일)와 DB 를 함께 고친다.
 * 편집·검증 화면의 분류 선택지와 글 목록 필터도 이 목록을 읽으므로 함께 다시 그린다.
 */
export async function savePostCategories(changes: PostCategoryChange[]): Promise<SaveCategoriesResult> {
  await requireAdmin()
  try {
    const categories = await collector.savePostCategories(changes)
    revalidatePath('/posts/categories')
    revalidatePath('/posts')
    revalidatePath('/review')
    const renamed = changes.filter((change) => change.previousName !== null && change.previousName !== change.name).length
    const message = renamed > 0 ? `저장했습니다. 이름을 바꾼 분류 ${renamed}개의 글도 옮겼습니다.` : '저장했습니다.'
    return { ok: true, message, categories }
  } catch (error) {
    const message = error instanceof CollectorRequestError ? error.message : `알 수 없는 오류: ${(error as Error).message}`
    return { ok: false, message }
  }
}
