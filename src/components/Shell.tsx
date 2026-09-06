'use client'

import { usePathname } from 'next/navigation'
import { signOut } from '@/app/login/actions'
import * as styles from '@/styles/console.css'
import { DocumentIcon, SlidersIcon } from './icons'

/**
 * 왼쪽 끝 레일이 대분류다. 여기서 고른 갈래의 메뉴만 사이드바에 나온다 —
 * 여섯 개를 한 줄로 늘어놓으면 '글을 다루는 곳'과 '수집을 손보는 곳'이 같은 무게로 보인다.
 *
 * 갈래를 상태로 들고 있지 않는다. 지금 경로가 어느 갈래에 속하는지로 정한다 —
 * 그래야 새로고침하거나 링크로 바로 들어와도 열려 있는 갈래가 어긋나지 않는다.
 */
const GROUPS = [
  {
    key: 'posts',
    label: '글',
    Icon: DocumentIcon,
    items: [
      { href: '/', label: '대시보드' },
      { href: '/review', label: '검토' },
      { href: '/posts', label: '글' },
      { href: '/picks', label: '오늘의 픽' },
    ],
  },
  {
    key: 'manage',
    label: '관리',
    Icon: SlidersIcon,
    items: [
      { href: '/blogs', label: '블로그' },
      { href: '/collect', label: '수집 실행' },
    ],
  },
  // as const — 튜플로 굳혀야 GROUPS[0] 과 items[0] 이 "없을 수도 있는 값"이 되지 않는다.
] as const

/** 대시보드는 정확히 일치할 때만 — 그러지 않으면 모든 경로에서 켜진다. */
function isCurrent(href: string, pathname: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

/** 로그인 전에는 관리 메뉴를 보여주지 않는다 — 무엇이 있는지도 알려줄 이유가 없다. */
const BARE_PATH_PREFIXES = ['/login', '/auth']

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // 로그인 화면은 제 레이아웃을 직접 짠다 — 콘솔의 여백·최대폭을 씌우면 안 된다.
  if (BARE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return <>{children}</>
  }

  // 어느 갈래에 있는지는 경로가 말해준다. 어디에도 걸리지 않으면 첫 갈래를 연다.
  const activeGroup = GROUPS.find((group) => group.items.some((item) => isCurrent(item.href, pathname))) ?? GROUPS[0]

  return (
    <div className={styles.shell}>
      <nav className={styles.rail} aria-label="대분류">
        {GROUPS.map((group) => {
          const isActive = group.key === activeGroup.key
          return (
            <a
              key={group.key}
              // 갈래를 누르면 그 갈래의 첫 화면으로 간다.
              href={group.items[0].href}
              className={`${styles.railItem} ${isActive ? styles.railItemActive : ''}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className={styles.railIcon}>
                <group.Icon size={18} strokeWidth={isActive ? 2.3 : 1.7} />
              </span>
              {group.label}
            </a>
          )
        })}
      </nav>

      <aside className={styles.sidebar}>
        <a href="/" className={styles.wordmark}>
          grep
          <span className={styles.wordmarkBadge}>관리</span>
        </a>

        <nav className={styles.menu} aria-label={`${activeGroup.label} 메뉴`}>
          {activeGroup.items.map((item) => {
            const isActive = isCurrent(item.href, pathname)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        <form action={signOut} style={{ marginTop: 'auto' }}>
          <button type="submit" className={styles.quietButton}>
            로그아웃
          </button>
        </form>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  )
}
