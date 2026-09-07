import darkTokens from './dark.json'
import lightTokens from './light.json'

/**
 * 빌드된 토큰. 원본은 grep 저장소의 tokens/src/*.tokens.json (W3C DTCG 형식)이다.
 *
 * 값을 여기서 고치지 말 것 — 이 디렉터리는 생성물이라 다음 빌드에 덮어써진다.
 */
export const lightTheme = lightTokens.semantic
export const darkTheme = darkTokens.semantic
