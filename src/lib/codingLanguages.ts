/**
 * 채점기가 아는 언어. collector(grep 의 judge.ts 를 옮긴 것)와 같은 id 다.
 *
 * collector.ts 와 따로 둔 이유 — 편집 화면(클라이언트)이 언어 목록을 읽어야 하는데,
 * collector.ts 는 server-only 인 기기 세션을 불러 브라우저 묶음에 들어갈 수 없다.
 */
export const CODING_LANGUAGES = ['c', 'cpp', 'java', 'kotlin', 'go', 'python', 'ruby', 'javascript', 'typescript'] as const
export type CodingLanguage = (typeof CODING_LANGUAGES)[number]

/**
 * 함수 방식(프로그래머스식) 문제를 풀 수 있는 언어 — collector 가 채점 하네스를 만든 언어다(FunctionSignature.LANGUAGES).
 * 참조 풀이도 이 언어로만 쓴다.
 */
export const FUNCTION_LANGUAGES = ['java', 'kotlin', 'python', 'javascript', 'cpp'] as const satisfies readonly CodingLanguage[]

/** 함수 방식 문제의 값 타입. collector 의 ValueType.id 와 같다 — 늘리면 collector 하네스·뼈대 코드도 함께 늘린다. */
export const FUNCTION_VALUE_TYPES = [
  'int',
  'long',
  'double',
  'boolean',
  'string',
  'int[]',
  'long[]',
  'double[]',
  'boolean[]',
  'string[]',
  'int[][]',
  'long[][]',
  'string[][]',
] as const
export type FunctionValueType = (typeof FUNCTION_VALUE_TYPES)[number]

/** 문제가 채울 함수. 케이스 입력은 매개변수마다 JSON 한 줄, 정답은 반환값 JSON 이다. */
export interface CodingFunction {
  name: string
  parameters: { name: string; type: FunctionValueType }[]
  returnType: FunctionValueType
}

export function isFunctionLanguage(language: CodingLanguage): boolean {
  return (FUNCTION_LANGUAGES as readonly CodingLanguage[]).includes(language)
}
