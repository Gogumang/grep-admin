import { requireAdmin } from '@/lib/session'
import * as styles from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { CollectRunner } from './CollectRunner'

export const dynamic = 'force-dynamic'

export default async function CollectPage() {
  await requireAdmin()

  return (
    <>
      <h1 className={console.pageTitle}>수집 실행</h1>
      <p className={styles.mutedText} style={{ marginBottom: 20 }}>
        블로그를 하나씩 돌며 새 글을 모은 뒤, 마지막에 한 번에 저장합니다.
        블로그 하나가 실패해도 나머지는 계속 진행됩니다.
      </p>
      <CollectRunner />
    </>
  )
}
