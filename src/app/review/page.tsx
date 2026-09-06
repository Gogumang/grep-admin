import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { ReviewList } from './ReviewList'

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  await requireAdmin()

  try {
    const pending = await collector.listPending()
    return (
      <>
        <h1 className={console.pageTitle}>검토 {pending.length}건</h1>
        <ReviewList initialPending={pending} />
      </>
    )
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>검토</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
