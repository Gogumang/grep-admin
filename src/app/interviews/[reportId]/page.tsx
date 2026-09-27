import { interviewReports } from '@/lib/interviewReports'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { InterviewEditor } from '../InterviewEditor'
import * as styles from '../interviews.css'

export const dynamic = 'force-dynamic'

export default async function InterviewReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  await requireAdmin()
  const { reportId } = await params

  try {
    const report = await interviewReports.get(decodeURIComponent(reportId))
    // key — 다른 후기로 옮겨 가도 앞 후기의 편집 상태가 남지 않게 한다.
    return <InterviewEditor key={report.id} report={report} />
  } catch (error) {
    return (
      <>
        <a href="/interviews" className={styles.backLink}>
          ⬅️ 면접 후기 목록
        </a>
        <h1 className={console.pageTitle}>면접 후기</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
