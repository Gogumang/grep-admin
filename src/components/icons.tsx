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

/** 채용 갈래 — 서류 가방 */
export function BriefcaseIcon({ size, strokeWidth }: IconProps) {
  return (
    <Glyph size={size} strokeWidth={strokeWidth}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
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

/**
 * 모바일 메뉴 버튼 — 줄 세 개.
 *
 * 열렸을 때 X로 바꾸지 않는다. 서랍이 열리면 버튼이 서랍에 가려 보이지 않고,
 * 닫는 길은 서랍 바깥(어둠막)·Esc·메뉴 선택 셋이다.
 */
export function MenuIcon({ size, strokeWidth }: IconProps) {
  return (
    <Glyph size={size} strokeWidth={strokeWidth}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Glyph>
  )
}

/** 행사 갈래 — 달력 */
export function CalendarIcon({ size, strokeWidth }: IconProps) {
  return (
    <Glyph size={size} strokeWidth={strokeWidth}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Glyph>
  )
}

/** 동아리 갈래 — 사람 둘 */
export function PeopleIcon({ size, strokeWidth }: IconProps) {
  return (
    <Glyph size={size} strokeWidth={strokeWidth}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c0-3 2.5-5.3 5.5-5.3s5.5 2.3 5.5 5.3" />
      <path d="M15.5 5.3a3 3 0 010 5.6M17.5 14.5c1.8.7 3 2.5 3 5" />
    </Glyph>
  )
}

/** GitHub 갈래 — 별 */
export function StarIcon({ size, strokeWidth }: IconProps) {
  return (
    <Glyph size={size} strokeWidth={strokeWidth}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </Glyph>
  )
}
