import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { PickEditor } from './PickEditor'

export const dynamic = 'force-dynamic'

export default async function PicksPage() {
  await requireAdmin()

  try {
    const [picks, posts] = await Promise.all([collector.listPicks(), collector.listPosts()])

    return (
      <>
        <h1 className={console.pageTitle}>오늘의 픽</h1>
        <p className={styles.mutedText} style={{ marginBottom: 20 }}>
          여기서 고른 글이 첫 화면 히어로에 이 순서대로 올라갑니다. 비우면 자동 선정으로 돌아갑니다.
        </p>
        <PickEditor posts={posts.filter((post) => !post.hidden)} initialPickUrls={picks.pickUrls} />
      </>
    )
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>오늘의 픽</h1>
        <p className={styles.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
