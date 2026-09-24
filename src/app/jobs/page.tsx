import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { JobReviewList } from './JobReviewList'

export const dynamic = 'force-dynamic'

/**
 * 수집된 채용공고 중 아직 아무도 보지 않은 것. 두 시간 안에 치우지 않으면 collector가 자동으로 올린다
 * (grep-airflow의 grep_auto_publish_jobs). 여기서는 올리지 말아야 할 공고를 먼저 치우는 자리다.
 */
export default async function JobReviewPage() {
  await requireAdmin()

  try {
    const pending = await collector.listPendingJobs()
    return (
      <>
        <h1 className={console.pageTitle}>채용 검증 {pending.length}건</h1>
        <p className={shared.mutedText} style={{ marginBottom: 20 }}>
          대기에 들어온 지 두 시간이 지나면 자동으로 공개됩니다. 올리지 않을 공고는 그 전에 치워 주세요.
        </p>
        <JobReviewList jobs={pending} mode="pending" />
      </>
    )
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>채용 검증</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
