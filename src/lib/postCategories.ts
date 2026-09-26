import type { FilterSelectOption } from '@/shared'
import { collector } from './collector'

/**
 * 글 분류 선택지. 목록의 정본은 collector DB 이고 어드민 '블로그 → 분류' 화면에서 고친다 — 코드에 두지 않는다.
 *
 * 선택지는 보조다. 못 읽으면 null 을 돌려주고, 화면은 분류 칸을 숨기거나 거르지 않은 채 나머지를 그린다.
 */
export async function loadPostCategoryOptions(): Promise<FilterSelectOption[] | null> {
  try {
    return (await collector.listPostCategories()).map(({ name }) => ({ value: name, label: name }))
  } catch {
    return null
  }
}
