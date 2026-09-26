import { requireAdmin } from '@/lib/session'
import { ProblemEditor } from '../ProblemEditor'

/** 새 문제. 저장하기 전에는 collector 에 아무것도 없다 — 저장하면 제 주소(/coding/<id>)로 옮겨간다. */
export default async function NewCodingProblemPage() {
  await requireAdmin()
  return <ProblemEditor problem={null} />
}
