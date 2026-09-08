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
        {/*
          숨긴 글까지 통째로 넘긴다. 여기서 걸러 버리면 이미 픽에 든 숨긴 글이 "목록에 없는 글"로
          보여, 지워진 글인지 숨긴 글인지 구분할 수 없다 — 새로 고를 후보에서만 빼면 된다.
        */}
        <PickEditor posts={posts} initialPickUrls={picks.pickUrls} />
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
