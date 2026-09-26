/**
 * 채점기가 아는 언어. collector(grep 의 judge.ts 를 옮긴 것)와 같은 id 다.
 *
 * collector.ts 와 따로 둔 이유 — 편집 화면(클라이언트)이 언어 목록을 읽어야 하는데,
 * collector.ts 는 server-only 인 기기 세션을 불러 브라우저 묶음에 들어갈 수 없다.
 */
export const CODING_LANGUAGES = ['c', 'cpp', 'java', 'kotlin', 'go', 'python', 'ruby', 'javascript', 'typescript'] as const
export type CodingLanguage = (typeof CODING_LANGUAGES)[number]
