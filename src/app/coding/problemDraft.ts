import { type CodingFunction, type CodingLanguage, type FunctionValueType, isFunctionLanguage } from '@/lib/codingLanguages'
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

/** 함수 방식 문제의 매개변수 한 줄. key 는 케이스와 같은 까닭으로 둔다. */
export interface ParameterDraft {
  key: string
  name: string
  type: FunctionValueType
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
  /**
   * 함수 방식(프로그래머스식)인지. 끄더라도 이름·매개변수는 들고 있는다 — 잘못 눌러 끈 순간 적어 둔 것이 사라지지 않게.
   * 저장할 때 꺼져 있으면 function 을 보내지 않는다(null).
   */
  isFunction: boolean
  functionName: string
  functionParameters: ParameterDraft[]
  functionReturnType: FunctionValueType
  /** 프로그래머스 기본 코드. 화면에서 고치지 않고 들고만 있다가 저장할 때 그대로 보낸다 — 모양을 바꾸면 비운다. */
  functionStarters: Partial<Record<CodingLanguage, string>>
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

/** 함수·매개변수 이름. 다섯 언어의 코드에 그대로 들어간다 — 예약어는 collector 가 다시 거른다. */
const IDENTIFIER_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,39}$/
const MAXIMUM_PARAMETER_COUNT = 10

const DEFAULT_TIME_LIMIT_MILLISECONDS = 1000
const DEFAULT_MEMORY_LIMIT_MEGABYTES = 256
const DEFAULT_LANGUAGE: CodingLanguage = 'python'

let draftKeySequence = 0
function nextKey(prefix: string): string {
  draftKeySequence += 1
  return `${prefix}-${draftKeySequence}`
}

export function emptyCase(isExample: boolean): CaseDraft {
  return { key: nextKey('case'), input: '', output: '', isExample, run: null }
}

export function emptyParameter(): ParameterDraft {
  return { key: nextKey('parameter'), name: '', type: 'int' }
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
    isFunction: false,
    functionName: 'solution',
    functionParameters: [{ ...emptyParameter(), name: 'arr', type: 'int[]' }],
    functionReturnType: 'int',
    functionStarters: {},
  }
}

export function toDraft(problem: CodingProblem): ProblemDraft {
  const empty = emptyDraft()
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
    cases: problem.cases.map((testCase) => ({ key: nextKey('case'), ...testCase, run: null })),
    isFunction: problem.function != null,
    functionName: problem.function?.name ?? empty.functionName,
    functionParameters:
      problem.function?.parameters.map((parameter) => ({ key: nextKey('parameter'), ...parameter })) ?? empty.functionParameters,
    functionReturnType: problem.function?.returnType ?? empty.functionReturnType,
    functionStarters: problem.function?.starters ?? {},
  }
}

/** 함수 방식이면 채울 함수, 아니면 null. 이름의 앞뒤 공백은 걷는다. */
export function toFunction(draft: ProblemDraft): CodingFunction | null {
  if (!draft.isFunction) return null
  return {
    name: draft.functionName.trim(),
    parameters: draft.functionParameters.map(({ name, type }) => ({ name: name.trim(), type })),
    returnType: draft.functionReturnType,
    starters: draft.functionStarters,
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
    function: toFunction(draft),
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

/** 함수 방식 문제만의 저장 조건. collector(CodingProblemRules.requireValidFunction)와 같다. */
function findFunctionProblems(draft: ProblemDraft): string[] {
  const problems: string[] = []
  if (!IDENTIFIER_PATTERN.test(draft.functionName.trim())) {
    problems.push(`함수 이름은 영문자로 시작하는 영문·숫자·밑줄이어야 합니다 (예: solution), 입력값: "${draft.functionName}"`)
  }
  if (draft.functionParameters.length === 0 || draft.functionParameters.length > MAXIMUM_PARAMETER_COUNT) {
    problems.push(`매개변수는 1~${MAXIMUM_PARAMETER_COUNT}개여야 합니다, 지금 ${draft.functionParameters.length}개`)
  }
  const names = draft.functionParameters.map((parameter) => parameter.name.trim())
  const badNames = names.filter((name) => !IDENTIFIER_PATTERN.test(name))
  if (badNames.length > 0) problems.push(`매개변수 이름이 규칙에 맞지 않습니다 (예: numbers), 입력값: "${badNames.join('", "')}"`)
  if (new Set(names).size !== names.length) problems.push('매개변수 이름이 겹칩니다.')
  if (!isFunctionLanguage(draft.referenceLanguage)) {
    problems.push(`함수 방식 문제의 참조 풀이는 java·kotlin·python·javascript·cpp 로 씁니다, 지금: ${draft.referenceLanguage}`)
  }
  return problems
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
  if (draft.isFunction) problems.push(...findFunctionProblems(draft))
  return problems
}

export function countCases(cases: CaseDraft[]): { exampleCount: number; hiddenCount: number } {
  const exampleCount = cases.filter((testCase) => testCase.isExample).length
  return { exampleCount, hiddenCount: cases.length - exampleCount }
}

/** JSON 한 줄로 읽히는지. 함수 방식 케이스의 매개변수·반환값 모양을 공개 전에 본다. */
function isJsonLine(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

/** 함수 방식 케이스 가운데 모양이 틀린 것의 번호. collector 공개 조건(매개변수 수만큼의 JSON 줄, 반환값 JSON)과 같다. */
function findMalformedFunctionCases(draft: ProblemDraft): number[] {
  return draft.cases.flatMap((testCase, index) => {
    const lines = testCase.input.split('\n').filter((line) => line.trim() !== '')
    const isWellFormed =
      lines.length === draft.functionParameters.length && lines.every(isJsonLine) && isJsonLine(testCase.output.trim())
    return isWellFormed ? [] : [index + 1]
  })
}

/**
 * 공개를 막는 이유. collector 의 공개 조건(예시 ≥ 1, 빈 출력 없음, 함수 방식이면 JSON 모양)과 같다.
 * 숨은 케이스는 요구하지 않는다 — 가져온 문제는 예시만 들고 오는데, 그것만으로 공개할 수 있게 한다.
 * 공개는 저장된 문제를 내보내므로, 고친 채 저장하지 않았으면 그것도 막는다 — 화면에 보이는 것과 나가는 것이 달라진다.
 */
export function findPublishBlockers(draft: ProblemDraft, hasUnsavedChanges: boolean): string[] {
  const blockers: string[] = []
  if (hasUnsavedChanges) blockers.push('저장하지 않은 변경이 있습니다')
  const { exampleCount } = countCases(draft.cases)
  if (exampleCount < 1) blockers.push('예시 케이스가 없습니다')
  const emptyOutputNumbers = draft.cases
    .map((testCase, index) => (testCase.output.trim() === '' ? index + 1 : null))
    .filter((number) => number !== null)
  if (emptyOutputNumbers.length > 0) blockers.push(`출력이 빈 케이스가 있습니다 (#${emptyOutputNumbers.join(', #')})`)
  if (draft.isFunction) {
    const malformed = findMalformedFunctionCases(draft)
    if (malformed.length > 0) {
      blockers.push(`매개변수마다 JSON 한 줄·반환값 JSON 모양이 아닌 케이스가 있습니다 (#${malformed.join(', #')})`)
    }
  }
  return blockers
}
