import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { JobReviewList } from './JobReviewList'

export const dynamic = 'force-dynamic'

/** 수집된 채용공고 중 아직 아무도 보지 않은 것. 여기서 올린 공고만 사이트에 실린다. */
export default async function JobReviewPage() {
  await requireAdmin()

  try {
    const pending = await collector.listPendingJobs()
    return (
      <>
        <h1 className={console.pageTitle}>채용 검증 {pending.length}건</h1>
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
