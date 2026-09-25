'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/login/actions'
import * as styles from '@/styles/console.css'
import { BriefcaseIcon, CalendarIcon, DocumentIcon, MenuIcon, PeopleIcon, SlidersIcon, StarIcon } from './icons'
import { GrepLogo } from './Logo'

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
    label: '블로그',
    Icon: DocumentIcon,
    items: [
      { href: '/review', label: '검증' },
      { href: '/posts', label: '글' },
      { href: '/blogs', label: '수집처' },
    ],
  },
  /*
    채용은 글과 갈래를 나눈다. 검증하는 대상도, 사이트에 나가는 곳도, 판단 기준도 다르다 —
    한 메뉴에 섞으면 "검증"을 눌렀을 때 무엇을 검증하는지 매번 따져야 한다.
  */
  {
    key: 'jobs',
    label: '채용',
    Icon: BriefcaseIcon,
    items: [
      { href: '/jobs', label: '검증' },
      { href: '/jobs/published', label: '공개한 공고' },
      { href: '/jobs/sources', label: '수집처' },
    ],
  },
  {
    key: 'events',
    label: '행사',
    Icon: CalendarIcon,
    items: [
      { href: '/events', label: '검증' },
      { href: '/events/published', label: '공개한 행사' },
      { href: '/events/sources', label: '수집처' },
    ],
  },
  {
    key: 'clubs',
    label: '동아리',
    Icon: PeopleIcon,
    items: [{ href: '/clubs', label: '수집처' }],
  },
  {
    key: 'github',
    label: 'GitHub',
    Icon: StarIcon,
    items: [
      { href: '/repositories', label: '인기 저장소' },
      { href: '/companies', label: '회사 저장소' },
    ],
  },
  {
    key: 'manage',
    label: '관리',
    Icon: SlidersIcon,
    items: [
      { href: '/', label: '대시보드' },
      { href: '/collect', label: '수집 실행' },
      { href: '/devices', label: '기기' },
      { href: '/admins', label: '허용 계정' },
    ],
  },
  // as const — 튜플로 굳혀야 GROUPS[0] 과 items[0] 이 "없을 수도 있는 값"이 되지 않는다.
] as const

/** 대시보드는 정확히 일치할 때만 — 그러지 않으면 모든 경로에서 켜진다. */
function isCurrent(href: string, pathname: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

/**
 * 갈래 안에서 불을 켤 메뉴 하나. 가장 길게 들어맞는 주소를 고른다 —
 * /jobs/published 는 /jobs 로도 시작해서, 들어맞는 것을 모두 켜면 두 메뉴가 함께 켜진다.
 */
function currentHref(items: readonly { href: string }[], pathname: string): string | undefined {
  return items
    .filter((item) => isCurrent(item.href, pathname))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href
}

/** 로그인 전에는 관리 메뉴를 보여주지 않는다 — 무엇이 있는지도 알려줄 이유가 없다. */
const BARE_PATH_PREFIXES = ['/login', '/auth']

/** 본문 최대폭을 풀 갈래. 검토는 목록도 미리보기도 화면을 그대로 쓰는 편이 낫다. */
const WIDE_PATH_PREFIXES = ['/review', '/jobs']

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  /** 좁은 화면의 서랍이 열려 있는지. 넓은 화면에서는 CSS가 무시하므로 값이 무엇이든 상관없다. */
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 화면을 옮기면 닫는다. 링크를 눌렀는데 서랍이 그대로면 도착한 화면이 가려진다.
  useEffect(() => setIsMenuOpen(false), [pathname])

  useEffect(() => {
    if (!isMenuOpen) return

    // 서랍이 열린 동안 뒤가 굴러가면, 닫고 났을 때 보던 자리를 잃는다.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  // 로그인 화면은 제 레이아웃을 직접 짠다 — 콘솔의 여백·최대폭을 씌우면 안 된다.
  if (BARE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return <>{children}</>
  }

  // 어느 갈래에 있는지는 경로가 말해준다. 어디에도 걸리지 않으면 첫 갈래를 연다.
  const activeGroup = GROUPS.find((group) => group.items.some((item) => isCurrent(item.href, pathname))) ?? GROUPS[0]
  const isWide = WIDE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))

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

      {/* 좁은 화면에만 나오는 윗줄. 레일이 사라진 자리에서 메뉴를 여는 유일한 길이다. */}
      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
          aria-controls="console-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <MenuIcon size={20} />
        </button>

        <a href="/">
          <GrepLogo label="관리" />
        </a>

        <form action={signOut} className={styles.topBarSpacer}>
          <button type="submit" className={styles.quietButton}>
            로그아웃
          </button>
        </form>
      </header>

      {isMenuOpen && (
        <div className={styles.menuDimmer} onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
      )}

      <aside className={styles.sidebar} id="console-menu" data-open={isMenuOpen}>
        <a href="/" className={styles.sidebarOnly}>
          <GrepLogo label="관리" />
        </a>

        {/*
          갈래를 모두 그려 두고 넓은 화면에서는 지금 갈래만 남긴다(otherGroupMenu).
          좁은 화면에는 레일이 없어서, 지금 갈래만 그리면 다른 갈래로 건너갈 길이 사라진다.
        */}
        {GROUPS.map((group) => (
          <nav
            key={group.key}
            className={`${styles.menu} ${group.key === activeGroup.key ? '' : styles.otherGroupMenu}`}
            aria-label={`${group.label} 메뉴`}
          >
            <p className={styles.menuGroupLabel}>{group.label}</p>
            {group.items.map((item) => {
              const isActive = item.href === currentHref(group.items, pathname)
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
        ))}

        <form action={signOut} className={styles.signOutForm}>
          <button type="submit" className={styles.quietButton}>
            로그아웃
          </button>
        </form>
      </aside>

      <main className={`${styles.main} ${isWide ? styles.mainWide : ''}`}>{children}</main>
    </div>
  )
}
