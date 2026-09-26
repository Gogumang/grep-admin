import type { CodingLanguage } from '@/lib/codingLanguages'
import type { CodingProblem, CodingProblemContent, ReferenceRunResult } from '@/lib/collector'

/**
 * 편집 화면이 들고 있는 케이스 하나.
 *
 * key 는 화면에서만 쓰는 이름표다 — 순서를 바꾸거나 지울 때 배열 번호를 key 로 쓰면
 * React 가 입력칸을 엉뚱한 케이스에 붙인다. run 은 마지막 참조 풀이 결과이고 입력을 고치면 지운다.
 */
export interface CaseDraft {
  key: string
  input: string
  output: string
  isExample: boolean
  run: ReferenceRunResult | null
}

/** 입력칸 그대로의 값. 숫자도 글자로 들고 있다 — 지우는 도중의 빈칸을 0 으로 바꾸면 고치기가 불편하다. */
export interface ProblemDraft {
  id: string
  title: string
  level: string
  tags: string
  statement: string
  inputFormat: string
  outputFormat: string
  timeLimitMs: string
  memoryLimitMb: string
  referenceLanguage: CodingLanguage
  referenceCode: string
  cases: CaseDraft[]
}

/** collector 가 받는 범위와 같다. 서버도 다시 검사하지만, 왕복 전에 화면에서 먼저 알려준다. */
const PROBLEM_ID_PATTERN = /^[a-z0-9-]+$/
const TIME_LIMIT_RANGE_MILLISECONDS = { minimum: 100, maximum: 10_000 }
const MEMORY_LIMIT_RANGE_MEGABYTES = { minimum: 16, maximum: 1024 }
export const MAXIMUM_CASE_COUNT = 50
/**
 * /coding/new 는 새 문제 화면의 주소라서, id 가 new 인 문제는 편집 화면으로 들어갈 길이 없다.
 */
const RESERVED_PROBLEM_IDS = ['new']

const DEFAULT_TIME_LIMIT_MILLISECONDS = 1000
const DEFAULT_MEMORY_LIMIT_MEGABYTES = 256
const DEFAULT_LANGUAGE: CodingLanguage = 'python'

let caseKeySequence = 0
function nextCaseKey(): string {
  caseKeySequence += 1
  return `case-${caseKeySequence}`
}

export function emptyCase(isExample: boolean): CaseDraft {
  return { key: nextCaseKey(), input: '', output: '', isExample, run: null }
}

export function emptyDraft(): ProblemDraft {
  return {
    id: '',
    title: '',
    level: '1',
    tags: '',
    statement: '',
    inputFormat: '',
    outputFormat: '',
    timeLimitMs: String(DEFAULT_TIME_LIMIT_MILLISECONDS),
    memoryLimitMb: String(DEFAULT_MEMORY_LIMIT_MEGABYTES),
    referenceLanguage: DEFAULT_LANGUAGE,
    referenceCode: '',
    cases: [emptyCase(true), emptyCase(false)],
  }
}

export function toDraft(problem: CodingProblem): ProblemDraft {
  return {
    id: problem.id,
    title: problem.title,
    level: String(problem.level),
    tags: problem.tags.join(', '),
    statement: problem.statement,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    timeLimitMs: String(problem.timeLimitMs),
    memoryLimitMb: String(problem.memoryLimitMb),
    referenceLanguage: problem.referenceLanguage ?? DEFAULT_LANGUAGE,
    referenceCode: problem.referenceCode ?? '',
    cases: problem.cases.map((testCase) => ({ key: nextCaseKey(), ...testCase, run: null })),
  }
}

export function toContent(draft: ProblemDraft): CodingProblemContent {
  return {
    title: draft.title.trim(),
    level: Number(draft.level),
    tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    statement: draft.statement,
    inputFormat: draft.inputFormat,
    outputFormat: draft.outputFormat,
    timeLimitMs: Number(draft.timeLimitMs),
    memoryLimitMb: Number(draft.memoryLimitMb),
    referenceLanguage: draft.referenceLanguage,
    referenceCode: draft.referenceCode,
    cases: draft.cases.map(({ input, output, isExample }) => ({ input, output, isExample })),
  }
}

/** 저장된 값과 같은지. run 결과·key 는 저장되지 않으니 견주지 않는다. */
export function isSameContent(left: ProblemDraft, right: ProblemDraft): boolean {
  return left.id === right.id && JSON.stringify(toContent(left)) === JSON.stringify(toContent(right))
}

function isIntegerInRange(value: string, range: { minimum: number; maximum: number }): boolean {
  const number = Number(value)
  return value.trim() !== '' && Number.isInteger(number) && number >= range.minimum && number <= range.maximum
}

/** 저장하기 전에 걸러낼 문제들. 비어 있으면 저장할 수 있다. */
export function findSaveProblems(draft: ProblemDraft): string[] {
  const problems: string[] = []
  if (!PROBLEM_ID_PATTERN.test(draft.id)) {
    problems.push(`id는 영소문자·숫자·하이픈만 쓸 수 있습니다 (예: bracket-balance), 입력값: "${draft.id}"`)
  } else if (RESERVED_PROBLEM_IDS.includes(draft.id)) {
    problems.push(`id "${draft.id}" 는 화면 주소와 겹쳐 쓸 수 없습니다.`)
  }
  if (!draft.title.trim()) problems.push('제목을 적어 주세요.')
  if (!['1', '2', '3'].includes(draft.level)) problems.push(`난이도는 1~3 이어야 합니다, 입력값: ${draft.level}`)
  if (!isIntegerInRange(draft.timeLimitMs, TIME_LIMIT_RANGE_MILLISECONDS)) {
    problems.push(`시간 제한은 100~10000ms 정수여야 합니다, 입력값: ${draft.timeLimitMs}`)
  }
  if (!isIntegerInRange(draft.memoryLimitMb, MEMORY_LIMIT_RANGE_MEGABYTES)) {
    problems.push(`메모리 제한은 16~1024MB 정수여야 합니다, 입력값: ${draft.memoryLimitMb}`)
  }
  if (draft.cases.length > MAXIMUM_CASE_COUNT) {
    problems.push(`케이스는 ${MAXIMUM_CASE_COUNT}개까지입니다, 지금 ${draft.cases.length}개`)
  }
  return problems
}

export function countCases(cases: CaseDraft[]): { exampleCount: number; hiddenCount: number } {
  const exampleCount = cases.filter((testCase) => testCase.isExample).length
  return { exampleCount, hiddenCount: cases.length - exampleCount }
}

/**
 * 공개를 막는 이유. collector 의 공개 조건(예시 ≥ 1, 숨은 ≥ 1, 빈 출력 없음)과 같다.
 * 공개는 저장된 문제를 내보내므로, 고친 채 저장하지 않았으면 그것도 막는다 — 화면에 보이는 것과 나가는 것이 달라진다.
 */
export function findPublishBlockers(draft: ProblemDraft, hasUnsavedChanges: boolean): string[] {
  const blockers: string[] = []
  if (hasUnsavedChanges) blockers.push('저장하지 않은 변경이 있습니다')
  const { exampleCount, hiddenCount } = countCases(draft.cases)
  if (exampleCount < 1) blockers.push('예시 케이스가 없습니다')
  if (hiddenCount < 1) blockers.push('숨은 케이스가 없습니다')
  const emptyOutputNumbers = draft.cases
    .map((testCase, index) => (testCase.output.trim() === '' ? index + 1 : null))
    .filter((number) => number !== null)
  if (emptyOutputNumbers.length > 0) blockers.push(`출력이 빈 케이스가 있습니다 (#${emptyOutputNumbers.join(', #')})`)
  return blockers
}
