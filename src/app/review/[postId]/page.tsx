import { collector } from '@/lib/collector'
import { loadPostCategoryOptions } from '@/lib/postCategories'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from '../ReviewWorkbench.css'
import { ReviewEditor } from './ReviewEditor'

export const dynamic = 'force-dynamic'

/** 글 하나를 검토하는 자리. 목록과 나눈 이유는 여기서 고치고 미리보는 데 폭이 필요해서다. */
export default async function ReviewDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  await requireAdmin()
  const { postId } = await params

  try {
    // 분류 선택지는 보조다 — 못 읽으면 분류 칸만 숨긴다(loadPostCategoryOptions 가 삼킨다).
    const [detail, categoryOptions] = await Promise.all([collector.findPending(postId), loadPostCategoryOptions()])
    return <ReviewEditor detail={detail} categoryOptions={categoryOptions} />
  } catch (error) {
    // 이미 공개했거나 치운 글일 수 있다. 목록으로 돌아갈 길을 함께 준다.
    return (
      <>
        <a href="/review" className={styles.backLink}>
          ⬅️ 검토 목록
        </a>
        <h1 className={console.pageTitle}>검토</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
