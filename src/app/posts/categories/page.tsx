import { collector, type PostCategoryItem } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { CategoryManager } from './CategoryManager'

export const dynamic = 'force-dynamic'

/** 저장(서버 액션)이 이름 바뀐 글 파일을 모두 다시 커밋할 때까지 기다린다. collector 쪽 제한(2분)보다 길게 둔다. */
export const maxDuration = 150

/** 글 분류 목록. 정본은 collector DB 이고, 저장하면 사이트(categories.json)와 collector 가 함께 따라간다. */
export default async function PostCategoriesPage() {
  await requireAdmin()

  let categories: PostCategoryItem[]
  try {
    categories = await collector.listPostCategories()
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>분류</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  return (
    <>
      <h1 className={console.pageTitle}>분류</h1>
      <CategoryManager categories={categories} />
    </>
  )
}
