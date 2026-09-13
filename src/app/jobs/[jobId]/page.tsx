import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as review from '../../review/ReviewWorkbench.css'
import { JobReviewDetail } from './JobReviewDetail'

export const dynamic = 'force-dynamic'

/** 공고 하나를 본문까지 보고 올릴지 정하는 자리. 목록에서 제목만으로 판단이 안 서는 공고를 연다. */
export default async function JobReviewDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  await requireAdmin()
  const { jobId } = await params

  try {
    const detail = await collector.findJob(jobId)
    return <JobReviewDetail detail={detail} />
  } catch (error) {
    return (
      <>
        <a href="/jobs" className={review.backLink}>
          ⬅️ 채용 검증
        </a>
        <h1 className={console.pageTitle}>채용공고</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
