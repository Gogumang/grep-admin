'use client'

import { usePathname } from 'next/navigation'
import { signOut } from '@/app/login/actions'
import * as styles from '@/styles/console.css'

/** 왼쪽 끝 아이콘 레일. 지금은 grep 하나뿐이라 자리만 잡아 둔다. */
const RAIL_ITEMS = [{ icon: '🍒', label: 'cherry', href: '/' }]

const MENU = [
  { href: '/', label: '대시보드' },
  { href: '/blogs', label: '블로그' },
  { href: '/posts', label: '글' },
  { href: '/picks', label: '오늘의 픽' },
  { href: '/collect', label: '수집 실행' },
]

/** 로그인 전에는 관리 메뉴를 보여주지 않는다 — 무엇이 있는지도 알려줄 이유가 없다. */
const BARE_PATH_PREFIXES = ['/login', '/auth']

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // 로그인 화면은 제 레이아웃을 직접 짠다 — 콘솔의 여백·최대폭을 씌우면 안 된다.
  if (BARE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return <>{children}</>
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.rail} aria-label="제품">
        {RAIL_ITEMS.map((item) => (
          <a key={item.href} href={item.href} className={styles.railItem}>
            <span className={`${styles.railIcon} ${styles.railIconActive}`}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <aside className={styles.sidebar}>
        <a href="/" className={styles.wordmark}>
          grep
          <span className={styles.wordmarkBadge}>관리</span>
        </a>

        <nav className={styles.menu} aria-label="메뉴">
          {MENU.map((item) => {
            // 대시보드는 정확히 일치할 때만 — 그러지 않으면 모든 경로에서 켜진다.
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
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
