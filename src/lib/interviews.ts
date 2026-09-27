/**
 * 면접 후기의 타입과 화면 이름표. 클라이언트 컴포넌트(편집 화면)도 읽으므로 collector 를 부르는 층(interviewReports.ts)과 나눈다 —
 * 그쪽은 서버 전용(토큰·기기 세션)이라 클라이언트 번들에 끌려 들어가면 빌드가 막힌다.
 */
export type InterviewCareerLevel = 'entry' | 'experienced' | 'intern'
export type InterviewOutcome = 'passed' | 'failed' | 'unknown'
export type InterviewStageType = 'document' | 'coding-test' | 'assignment' | 'technical' | 'culture' | 'executive' | 'other'
export type InterviewFormat =
  | 'live-coding'
  | 'whiteboard'
  | 'assignment-review'
  | 'conversation'
  | 'presentation'
  | 'online-test'

export const CAREER_LEVEL_LABELS: Record<InterviewCareerLevel, string> = {
  entry: '신입',
  experienced: '경력',
  intern: '인턴',
}

export const OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  passed: '합격',
  failed: '불합격',
  unknown: '모름',
}

export const STAGE_TYPE_LABELS: Record<InterviewStageType, string> = {
  document: '서류',
  'coding-test': '코딩테스트',
  assignment: '과제',
  technical: '기술면접',
  culture: '컬처핏·인성',
  executive: '임원면접',
  other: '기타',
}

export const FORMAT_LABELS: Record<InterviewFormat, string> = {
  'live-coding': '라이브코딩',
  whiteboard: '화이트보드',
  'assignment-review': '과제 리뷰',
  conversation: '대화형 질문',
  presentation: '발표',
  'online-test': '온라인 시험',
}

/** 목록 한 줄. 단계·질문 본문은 없다. */
export interface InterviewReportSummary {
  id: string
  companyName: string
  jobCategory: string | null
  careerLevel: InterviewCareerLevel | null
  /** YYYY-MM. 원문에 없으면 null. */
  interviewedIn: string | null
  outcome: InterviewOutcome
  stageTypes: InterviewStageType[]
  questionCount: number
  /** ISO-8601 */
  updatedAt: string
}

export interface InterviewQuestion {
  question: string
  followUps: string[]
  topics: string[]
}

export interface InterviewStage {
  type: InterviewStageType
  format: InterviewFormat | null
  durationMinutes: number | null
  note: string | null
  questions: InterviewQuestion[]
}

/** 저장할 때 보내는 모양. 빈 문자열은 collector 가 없음으로 바꾼다. */
export interface InterviewReportContent {
  companyName: string
  jobCategory: string | null
  careerLevel: InterviewCareerLevel | null
  interviewedIn: string | null
  outcome: InterviewOutcome
  sourceUrl: string | null
  sourceTitle: string | null
  memo: string | null
  stages: InterviewStage[]
}

export interface InterviewReport extends InterviewReportContent {
  id: string
  createdAt: string
  updatedAt: string
}
