import type { Post } from '@/lib/collector'
import * as styles from './postCountByBlog.css'

interface BlogCount {
  blogKey: string
  blogName: string
  total: number
  hidden: number
}

/**
 * 회사(블로그)별로 글이 몇 개 들어와 있는지. 많은 순으로 왼쪽부터 세운다.
 *
 * 축과 눈금은 두지 않는다 — 막대 위에 숫자가 그대로 붙어 있어서 눈금을 세는 일이 없다.
 * 색이 한 가지라 범례도 없다. 제목이 이 막대가 무엇인지 말한다.
 */
export function PostCountByBlog({ posts }: { posts: Post[] }) {
  const rows = summarize(posts)
  const most = rows[0]
  if (!most) return null

  return (
    <div className={styles.chart}>
      {rows.map((row) => (
        <div
          key={row.blogKey}
          className={styles.column}
          title={`${row.blogName} — 전체 ${row.total}개, 공개 ${row.total - row.hidden}개, 숨김 ${row.hidden}개`}
        >
          <span className={styles.count}>{row.total}</span>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.bar} style={{ height: `${(row.total / most.total) * 100}%` }} />
          </div>
          <span className={styles.name}>{row.blogName}</span>
        </div>
      ))}
    </div>
  )
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
