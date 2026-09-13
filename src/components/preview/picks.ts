/*
 * 사이트의 자동 선정 규칙을 그대로 옮긴 것이다 (grep/src/service/picks.ts).
 *
 * 픽을 비워 두면 사이트가 이 규칙으로 히어로를 채운다. 어드민이 "지금 무엇이 나가 있는지"를
 * 보여주려면 같은 계산을 해야 하는데, 저장소가 나뉘어 있어 import 할 수 없다.
 *
 * 규칙이 갈리면 어드민이 실제와 다른 다섯 개를 보여주게 된다 — pnpm check:preview-copies 가
 * 원본과 글자까지 대조한다. 사이트를 고쳤으면 이 파일도 다시 옮겨야 통과한다.
 *
 * 옮기면서 달라지는 곳은 Post 타입을 어디서 가져오는가 한 줄뿐이다.
 */
import type { Post } from '@/lib/collector'

const PICK_COUNT = 5

const PICK_WINDOW_DAYS = 7

/**
 * 블로그가 겹치지 않게 고르는 것이 1순위다. 다만 그 규칙만 쓰면 수집된 블로그가
 * 하나뿐일 때 픽이 한 개로 줄어 슬라이더가 사라진다 — 모자라면 차례로 채운다.
 */
export function selectTodayPicks(posts: Post[], manualPickUrls: string[], now: Date = new Date()): Post[] {
  if (manualPickUrls.length > 0) {
    const byUrl = new Map(posts.map((post) => [post.url, post]))
    const manualPicks = manualPickUrls.map((url) => byUrl.get(url)).filter((post): post is Post => post !== undefined)
    if (manualPicks.length > 0) return manualPicks.slice(0, PICK_COUNT)
  }

  const windowStart = new Date(now.getTime() - PICK_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const recent = posts.filter((post) => new Date(post.publishedAt) >= windowStart)

  const picks: Post[] = []
  const chosenIds = new Set<string>()

  const take = (candidates: Post[], requireNewBlog: boolean) => {
    const seenBlogKeys = new Set(picks.map((post) => post.blogKey))
    for (const post of candidates) {
      if (picks.length >= PICK_COUNT) return
      if (chosenIds.has(post.id)) continue
      if (requireNewBlog && seenBlogKeys.has(post.blogKey)) continue

      seenBlogKeys.add(post.blogKey)
      chosenIds.add(post.id)
      picks.push(post)
    }
  }

  take(recent, true) // 1순위: 최근 글, 블로그 안 겹치게
  take(recent, false) // 2순위: 최근 글이면 같은 블로그라도
  take(posts, false) // 3순위: 기간 밖이라도 최신순으로
  return picks
}

export function parsePicksTable(markdown: string): string[] {
  const urls: string[] = []

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|')) continue

    const firstCell = trimmed.replace(/^\|/, '').split('|')[0]?.trim() ?? ''
    if (/^https?:\/\/\S+$/.test(firstCell)) urls.push(firstCell)
  }
  return urls
}
