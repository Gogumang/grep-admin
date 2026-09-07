import { assignVars, globalStyle } from '@vanilla-extract/css'
import { darkTheme, lightTheme } from '@/tokens/build/themes'
import { vars } from './contract.css'

/**
 * 토큰 값은 여기 없다. 원본은 grep 저장소의 tokens/src/*.tokens.json 이고,
 * 구운 결과(src/tokens/build)를 복사해 온 것이다. 저장소가 나뉘어 있어 직접 참조할 수 없다.
 *
 * (이하) 원본은 packages/tokens/src/*.tokens.json (W3C DTCG 형식)이고,
 * Style Dictionary가 구운 결과를 그대로 주입한다.
 *
 * 색을 고치려면 이 파일이 아니라 JSON을 고쳐야 한다. 그래야 Figma·다른 플랫폼과
 * 같은 원천을 보게 되고, 화면과 디자인 도구가 갈라지지 않는다.
 *
 * 테마를 세 갈래로 건다:
 *   1. :root                      — 기본은 라이트
 *   2. prefers-color-scheme: dark — 시스템 설정을 따른다
 *   3. [data-theme]               — 사용자가 고른 값이 시스템 설정을 이긴다
 * 3번이 2번보다 뒤에 와야 토글이 양방향으로 동작한다.
 */
globalStyle(':root', { vars: assignVars(vars, lightTheme) })

globalStyle(':root', {
  '@media': { '(prefers-color-scheme: dark)': { vars: assignVars(vars, darkTheme) } },
})

globalStyle(':root[data-theme="light"]', { vars: assignVars(vars, lightTheme) })
globalStyle(':root[data-theme="dark"]', { vars: assignVars(vars, darkTheme) })
