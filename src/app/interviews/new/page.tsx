import { requireAdmin } from '@/lib/session'
import { InterviewEditor } from '../InterviewEditor'

/** 새 면접 후기. 저장하기 전에는 collector 에 아무것도 없다 — 저장하면 제 주소(/interviews/<id>)로 옮겨간다. */
export default async function NewInterviewReportPage() {
  await requireAdmin()
  return <InterviewEditor report={null} />
}
