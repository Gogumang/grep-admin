import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { PostManager } from './PostManager'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  await requireAdmin()

  try {
    // 숨긴 글까지 전부 읽는다 — 어드민은 숨긴 것을 다시 드러낼 수 있어야 한다.
    const posts = await collector.listPosts()
    return (
      <>
        <h1 className={console.pageTitle}>글</h1>
        <PostManager posts={posts} />
      </>
    )
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>글</h1>
        <p className={styles.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
