import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { BlogManager } from './BlogManager'

export const dynamic = 'force-dynamic'

/** 저장 단계(서버 액션)가 새 글 본문을 다 읽을 때까지 기다린다. 기본 제한 시간으로는 중간에 끊긴다. */
export const maxDuration = 120

export default async function BlogsPage() {
  await requireAdmin()

  try {
    const feeds = await collector.listFeeds()
    return (
      <>
        <h1 className={console.pageTitle}>블로그 수집처</h1>
        <BlogManager feeds={feeds} />
      </>
    )
  } catch (error) {
    // collector가 안 떠 있으면 여기서 멈춘다. 무엇을 해야 하는지 알려줘야 한다.
    return (
      <>
        <h1 className={console.pageTitle}>블로그 수집처</h1>
        <p className={styles.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
