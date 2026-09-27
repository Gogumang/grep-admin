import type {
  InterviewCareerLevel,
  InterviewFormat,
  InterviewOutcome,
  InterviewReport,
  InterviewReportContent,
  InterviewStageType,
} from '@/lib/interviews'

/**
 * 편집 화면이 들고 있는 후기. 입력칸 그대로 문자열로 두고, 저장할 때만 collector 의 모양으로 옮긴다.
 * 꼬리질문은 한 줄에 하나, 주제는 쉼표로 나눠 적는다.
 */
export interface QuestionDraft {
  /** 목록 key — 순서를 바꾸거나 지워도 입력 중인 칸이 다른 질문으로 옮겨 붙지 않게 한다. */
  key: string
  question: string
  followUps: string
  topics: string
}

export interface StageDraft {
  key: string
  type: InterviewStageType
  format: InterviewFormat | null
  durationMinutes: string
  note: string
  questions: QuestionDraft[]
}

export interface InterviewDraft {
  companyName: string
  jobCategory: string
  careerLevel: InterviewCareerLevel | null
  /** input type="month" 의 값(YYYY-MM) 그대로. */
  interviewedIn: string
  outcome: InterviewOutcome
  sourceUrl: string
  sourceTitle: string
  memo: string
  stages: StageDraft[]
}

function newKey(): string {
  return crypto.randomUUID()
}

export function emptyQuestion(): QuestionDraft {
  return { key: newKey(), question: '', followUps: '', topics: '' }
}

export function emptyStage(type: InterviewStageType = 'technical'): StageDraft {
  return { key: newKey(), type, format: null, durationMinutes: '', note: '', questions: [emptyQuestion()] }
}

export function emptyDraft(): InterviewDraft {
  return {
    companyName: '',
    jobCategory: '',
    careerLevel: null,
    interviewedIn: '',
    outcome: 'unknown',
    sourceUrl: '',
    sourceTitle: '',
    memo: '',
    stages: [emptyStage()],
  }
}

export function toDraft(report: InterviewReport): InterviewDraft {
  return {
    companyName: report.companyName,
    jobCategory: report.jobCategory ?? '',
    careerLevel: report.careerLevel,
    interviewedIn: report.interviewedIn ?? '',
    outcome: report.outcome,
    sourceUrl: report.sourceUrl ?? '',
    sourceTitle: report.sourceTitle ?? '',
    memo: report.memo ?? '',
    stages: report.stages.map((stage) => ({
      key: newKey(),
      type: stage.type,
      format: stage.format,
      durationMinutes: stage.durationMinutes === null ? '' : String(stage.durationMinutes),
      note: stage.note ?? '',
      questions: stage.questions.map((question) => ({
        key: newKey(),
        question: question.question,
        followUps: question.followUps.join('\n'),
        topics: question.topics.join(', '),
      })),
    })),
  }
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function splitTopics(text: string): string[] {
  return text
    .split(',')
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0)
}

function blankToNull(text: string): string | null {
  const trimmed = text.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** 질문칸을 비워 둔 줄은 보내지 않는다 — 단계를 만들며 미리 열어 둔 빈 칸이 저장을 막으면 안 된다. */
export function toContent(draft: InterviewDraft): InterviewReportContent {
  return {
    companyName: draft.companyName.trim(),
    jobCategory: blankToNull(draft.jobCategory),
    careerLevel: draft.careerLevel,
    interviewedIn: blankToNull(draft.interviewedIn),
    outcome: draft.outcome,
    sourceUrl: blankToNull(draft.sourceUrl),
    sourceTitle: blankToNull(draft.sourceTitle),
    memo: blankToNull(draft.memo),
    stages: draft.stages.map((stage) => ({
      type: stage.type,
      format: stage.format,
      durationMinutes: stage.durationMinutes.trim() === '' ? null : Number(stage.durationMinutes),
      note: blankToNull(stage.note),
      questions: stage.questions
        .filter((question) => question.question.trim().length > 0)
        .map((question) => ({
          question: question.question.trim(),
          followUps: splitLines(question.followUps),
          topics: splitTopics(question.topics),
        })),
    })),
  }
}

/** 저장 전에 화면에서 바로 알려 줄 것. 나머지 규칙은 collector 가 메시지와 함께 거절한다. */
export function findSaveProblems(draft: InterviewDraft): string[] {
  const problems: string[] = []
  if (!draft.companyName.trim()) problems.push('회사 이름을 넣어 주세요.')
  if (draft.stages.length === 0) problems.push('전형 단계를 하나 이상 넣어 주세요.')
  draft.stages.forEach((stage, index) => {
    const minutes = stage.durationMinutes.trim()
    if (minutes !== '' && !/^\d+$/.test(minutes)) {
      problems.push(`${index + 1}번째 단계의 소요 시간은 분 단위 숫자여야 합니다 (예: 60), 입력값: ${minutes}`)
    }
  })
  return problems
}

export function isSameContent(left: InterviewDraft, right: InterviewDraft): boolean {
  return JSON.stringify(toContent(left)) === JSON.stringify(toContent(right))
}
