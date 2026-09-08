import { BarChart, type BarChartData } from '@/shared'
import type { Post } from '@/lib/collector'

interface BlogCount {
  blogKey: string
  blogName: string
  total: number
  hidden: number
}

/**
 * 회사(블로그)별로 글이 몇 개 들어와 있는지. 많은 순으로 왼쪽부터 세운다.
 *
 * 막대를 그리는 일은 공용 BarChart가 맡고, 여기는 "무엇을 세는가"만 정한다 —
 * 색이 한 가지인 것도 그 결정이다. 회사마다 다른 색을 주면 색이 순위를 따라다니게 되고,
 * 회사가 늘 때마다 색이 뒤바뀐다.
 */
export function PostCountByBlog({ posts }: { posts: Post[] }) {
  const rows = summarize(posts)
  if (rows.length === 0) return null

  const data: BarChartData[] = rows.map((row) => ({
    value: row.total,
    label: row.blogName,
    barAnnotation: row.total,
    title: `${row.blogName} — 전체 ${row.total}개, 공개 ${row.total - row.hidden}개, 숨김 ${row.hidden}개`,
  }))

  return <BarChart data={data} fill={{ type: 'all-bar', theme: 'blue' }} height={220} />
}

/** blogKey로 묶는다 — 이름은 같아도 다른 블로그일 수 있고, 이름은 바뀔 수 있다. */
function summarize(posts: Post[]): BlogCount[] {
  const byKey = new Map<string, BlogCount>()

  for (const post of posts) {
    const current = byKey.get(post.blogKey)
    byKey.set(post.blogKey, {
      blogKey: post.blogKey,
      blogName: post.blogName,
      total: (current?.total ?? 0) + 1,
      hidden: (current?.hidden ?? 0) + (post.hidden ? 1 : 0),
    })
  }

  // 많은 순. 같은 수면 이름순으로 고정한다 — 그러지 않으면 새로고침마다 순서가 뒤바뀐다.
  return [...byKey.values()].sort((a, b) => b.total - a.total || a.blogName.localeCompare(b.blogName, 'ko'))
}
