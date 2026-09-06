import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { BlogManager } from './BlogManager'

export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  await requireAdmin()

  try {
    const feeds = await collector.listFeeds()
    return (
      <>
        <h1 className={console.pageTitle}>블로그 {feeds.length}개</h1>
        <BlogManager feeds={feeds} />
      </>
    )
  } catch (error) {
    // collector가 안 떠 있으면 여기서 멈춘다. 무엇을 해야 하는지 알려줘야 한다.
    return (
      <>
        <h1 className={console.pageTitle}>블로그</h1>
        <p className={styles.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
