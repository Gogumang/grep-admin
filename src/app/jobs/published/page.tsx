import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { JobReviewList } from '../JobReviewList'

export const dynamic = 'force-dynamic'

/**
 * 사이트에 올라가 있는 채용공고. 잘못 올린 공고를 내리는 자리다.
 * 원문에서 마감된 공고는 collector가 수집 때 알아서 내리므로 여기서 치울 필요가 없다.
 */
export default async function PublishedJobsPage() {
  await requireAdmin()

  try {
    const published = await collector.listPublishedJobs()
    return (
      <>
        <h1 className={console.pageTitle}>공개한 채용공고 {published.length}건</h1>
        <JobReviewList jobs={published} mode="published" />
      </>
    )
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>공개한 채용공고</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
