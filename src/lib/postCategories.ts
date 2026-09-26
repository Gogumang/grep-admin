/**
 * 글 분류. 사이트(grep src/shared/types/post.ts 의 POST_CATEGORIES)와 collector(PostCategoryPolicy.CATEGORIES)와
 * 같은 14개이고 순서도 같다 — 하나를 고치면 셋을 함께 고친다. collector 는 이 밖의 이름으로 고치는 것을 400 으로 막는다.
 */
export const POST_CATEGORIES = [
  'Frontend',
  'Backend',
  'Android',
  'iOS',
  'Cross-platform',
  'DevOps',
  'Data',
  'AI/ML',
  'Security',
  'QA',
  'Engineering',
  'Design',
  'Product',
  'Culture',
] as const

/** 분류를 고르는 칸(FilterSelect)의 선택지. */
export const POST_CATEGORY_OPTIONS = POST_CATEGORIES.map((category) => ({ value: category, label: category }))
