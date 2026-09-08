import * as styles from '@/styles/logo.css'
import {
  LABEL_PATH,
  LOGO_HEIGHT,
  LOGO_WIDTH,
  LOGO_WIDTH_WITH_LABEL,
  NAME_PATH,
  SYMBOL_CARET_PATH,
  SYMBOL_CURSOR_PATH,
  SYMBOL_STROKE_WIDTH,
  SYMBOL_TRANSFORM,
} from './logoPaths'

/**
 * grep 로고 — 한 장으로 그려진 잠금(lockup).
 *
 * 앱인토스 콘솔 로고와 같은 짜임이다: 브랜드 색 심볼 + 굵기가 둘로 갈리는 글자
 * (가는 수식어 + 굵은 이름). 다만 한국어는 이름이 먼저 와야 읽히므로 순서를 뒤집었다 —
 * `apps in **toss**` 가 `**grep** 관리` 가 된다.
 *
 * 글자는 조판이 아니라 패스다. 토스도 로고를 웹폰트로 짜지 않고 이미지 에셋으로 배포한다 —
 * 폰트가 대체되면 로고 모양이 기기마다 달라지기 때문이다. 패스는 `scripts/build-wordmark.py`가
 * Pretendard 아웃라인에서 굽는다. 심볼 기하는 사이트 favicon과 같은 좌표다.
 *
 * 크기는 CSS 높이 하나로 정한다. 수식어가 붙어도 글자 크기가 달라지지 않도록
 * 세로 좌표계는 그대로 두고 뷰박스 폭만 늘린다.
 */
export function GrepLogo({ label }: { label?: string }) {
  const width = label ? LOGO_WIDTH_WITH_LABEL : LOGO_WIDTH

  return (
    <svg
      className={styles.logo}
      viewBox={`0 0 ${width} ${LOGO_HEIGHT}`}
      role="img"
      aria-label={label ? `grep ${label}` : 'grep'}
    >
      <g
        className={styles.symbol}
        transform={SYMBOL_TRANSFORM}
        fill="none"
        stroke="currentColor"
        strokeWidth={SYMBOL_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 셸 프롬프트. grep이 명령어라는 것 말고 다른 설명이 필요 없다. */}
        <path d={SYMBOL_CARET_PATH} />
        {/* 커서 자리. 캐럿과 같은 무게로 두면 둘이 한 글자로 뭉쳐 읽힌다. */}
        <path d={SYMBOL_CURSOR_PATH} opacity="0.45" />
      </g>

      <path className={styles.name} d={NAME_PATH} />
      {label ? <path className={styles.label} d={LABEL_PATH} /> : null}
    </svg>
  )
}
