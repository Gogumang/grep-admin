'use server'

import { revalidatePath } from 'next/cache'
import { CollectorRequestError } from '@/lib/collector'
import { interviewReports } from '@/lib/interviewReports'
import type { InterviewReport, InterviewReportContent } from '@/lib/interviews'
import { requireAdmin } from '@/lib/session'

export interface InterviewActionResult {
  ok: boolean
  message: string
  /** 저장한 후기. 편집 화면이 '저장된 값'을 서버 기준으로 다시 잡는다. */
  report?: InterviewReport
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}

/** reportId 가 없으면 새로 만든다. */
export async function saveInterviewReport(
  reportId: string | null,
  content: InterviewReportContent,
): Promise<InterviewActionResult> {
  await requireAdmin()

  try {
    const report = reportId
      ? await interviewReports.update(reportId, content)
      : await interviewReports.create(content)
    revalidatePath('/interviews')
    revalidatePath(`/interviews/${report.id}`)
    return { ok: true, message: '저장했습니다.', report }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

export async function deleteInterviewReport(reportId: string): Promise<InterviewActionResult> {
  await requireAdmin()

  try {
    await interviewReports.remove(reportId)
    revalidatePath('/interviews')
    return { ok: true, message: '지웠습니다.' }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
