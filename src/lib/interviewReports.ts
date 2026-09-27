/**
 * 면접 후기 — collector 의 /api/admin/interviews 를 부르는 층. 서버에서만 쓴다(Server Components·Server Actions).
 *
 * 후기 원본은 어드민에서만 본다. collector 도 이 경로를 어드민 토큰 + 기기 세션으로만 연다(사이트 토큰으로는 403).
 * collector.ts 가 800줄을 넘어 갈래째 이 파일로 뺐다 — 요청 자체(토큰·세션·타임아웃)는 같은 request 를 쓴다.
 */
import { request } from './collector'
import type { InterviewReport, InterviewReportContent, InterviewReportSummary } from './interviews'

const INTERVIEW_PATH = '/api/admin/interviews'

export const interviewReports = {
  /** 전체를 받는다 — 목록 화면이 회사 칩을 전체에서 만들고 거르기도 제 손으로 한다. */
  list: () => request<InterviewReportSummary[]>(INTERVIEW_PATH),

  /** 없으면 interview_not_found 로 실패한다. */
  get: (reportId: string) => request<InterviewReport>(`${INTERVIEW_PATH}/${encodeURIComponent(reportId)}`),

  create: (content: InterviewReportContent) =>
    request<InterviewReport>(INTERVIEW_PATH, { method: 'POST', body: JSON.stringify(content) }),

  /** 단계·질문은 보낸 순서 그대로 통째로 바뀐다. */
  update: (reportId: string, content: InterviewReportContent) =>
    request<InterviewReport>(`${INTERVIEW_PATH}/${encodeURIComponent(reportId)}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    }),

  remove: (reportId: string) =>
    request<void>(`${INTERVIEW_PATH}/${encodeURIComponent(reportId)}`, { method: 'DELETE' }),
}
