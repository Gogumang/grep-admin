/**
 * 메뉴 아이콘.
 *
 * 이모지를 쓰지 않는다 — OS·브라우저마다 다른 그림이 나오고, 굵기도 색도 맞출 수 없어서
 * 옆 글자와 따로 논다. 토스 콘솔도 전부 선 아이콘이다.
 *
 * 선 두께 1.7px, 색은 currentColor. 색을 물려받으므로 활성 상태에서 글자와 함께 진해진다.
 */
function Glyph({ size = 18, strokeWidth = 1.7, children }: { size?: number; strokeWidth?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

type IconProps = { size?: number; strokeWidth?: number }

/** 글 갈래 — 문서 한 장 */
export function DocumentIcon({ size, strokeWidth }: IconProps) {
  return (
    <Glyph size={size} strokeWidth={strokeWidth}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </Glyph>
  )
}

/** 관리 갈래 — 손잡이 달린 조절 막대 */
export function SlidersIcon({ size, strokeWidth }: IconProps) {
  return (
    <Glyph size={size} strokeWidth={strokeWidth}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="2" fill="currentColor" stroke="none" />
    </Glyph>
  )
}
