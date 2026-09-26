import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from '../coding.css'
import { ProblemEditor } from '../ProblemEditor'

export const dynamic = 'force-dynamic'

export default async function CodingProblemPage({ params }: { params: Promise<{ problemId: string }> }) {
  await requireAdmin()
  const { problemId } = await params

  try {
    const problem = await collector.getCodingProblem(decodeURIComponent(problemId))
    // key — 저장 뒤 다른 문제로 옮겨 가도 앞 문제의 편집 상태가 남지 않게 한다.
    return <ProblemEditor key={problem.id} problem={problem} />
  } catch (error) {
    return (
      <>
        <a href="/coding" className={styles.backLink}>
          ⬅️ 문제 목록
        </a>
        <h1 className={console.pageTitle}>문제</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
