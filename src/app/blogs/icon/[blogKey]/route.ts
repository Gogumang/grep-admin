import { NextResponse, type NextRequest } from 'next/server'
import { collector } from '@/lib/collector'
import { iconCandidates, isHostingPlatform, siteUrlOf } from '@/lib/blogIconSource'
import { requireAdmin } from '@/lib/session'

/**
 * 아직 public/blog-icons 에 굳히지 않은 블로그의 아이콘. BlogIcon 이 정적 파일이 없을 때 여기로 물러난다 —
 * 블로그를 추가하자마자 아이콘이 보이게 하려는 것이다(스크립트로 굳히기 전까지).
 *
 * 받을 주소는 요청이 아니라 collector 의 블로그 목록에서 정한다 — 주소를 요청에서 받으면 아무 곳이나 대신 받아 주는 창구가 된다.
 * 한 번 찾은 아이콘은 이 서버 인스턴스와 브라우저에 하루 둔다. 못 찾으면 404 — 화면에는 회색 자리로 남는다.
 */

const FETCH_TIMEOUT_MILLISECONDS = 5_000
/** 아이콘 하나는 수십 KB 다. 이보다 크면 아이콘이 아니라 다른 것을 받은 것이다. */
const MAX_ICON_BYTES = 512 * 1024
/** 첫 화면 HTML. 아이콘 선언은 head 에 있어 앞부분만 있어도 되지만 잘라 읽을 수 없어 크기로만 막는다. */
const MAX_PAGE_BYTES = 4 * 1024 * 1024
const CACHE_SECONDS = 60 * 60 * 24
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36'

type FoundIcon = { body: ArrayBuffer; contentType: string } | null
const foundByBlogKey = new Map<string, { icon: FoundIcon; at: number }>()

export async function GET(_request: NextRequest, { params }: { params: Promise<{ blogKey: string }> }) {
  await requireAdmin()
  const { blogKey } = await params

  const cached = foundByBlogKey.get(blogKey)
  const icon = cached && Date.now() - cached.at < CACHE_SECONDS * 1000 ? cached.icon : await findIcon(blogKey)
  // 못 찾은 것도 기억한다 — 목록을 열 때마다 남의 사이트를 다시 두드리지 않게.
  if (!cached || cached.icon !== icon) foundByBlogKey.set(blogKey, { icon, at: Date.now() })

  if (!icon) return new NextResponse(null, { status: 404, headers: { 'cache-control': `private, max-age=${CACHE_SECONDS}` } })
  return new NextResponse(icon.body, {
    headers: { 'content-type': icon.contentType, 'cache-control': `private, max-age=${CACHE_SECONDS}` },
  })
}

async function findIcon(blogKey: string): Promise<FoundIcon> {
  // 목록을 못 읽으면 아이콘도 없다. 아이콘은 보조라 예외를 올리지 않는다.
  const feed = (await collector.listFeeds().catch(() => [])).find((candidate) => candidate.blogKey === blogKey)
  if (!feed || isHostingPlatform(feed.feedUrl)) return null
  const siteUrl = siteUrlOf(feed.homepageUrl, feed.feedUrl)
  if (!siteUrl || isHostingPlatform(siteUrl)) return null

  const page = await get(siteUrl, MAX_PAGE_BYTES)
  const html = page && page.contentType.includes('html') ? new TextDecoder().decode(page.body) : ''
  for (const iconUrl of iconCandidates(html, page?.url ?? siteUrl)) {
    const response = await get(iconUrl, MAX_ICON_BYTES)
    // HTML 을 주는 /favicon.ico(토스·인프랩)나 빈 파일(SSAFY)은 아이콘이 아니다.
    if (response && response.contentType.startsWith('image/') && response.body.byteLength > 0) {
      return { body: response.body, contentType: response.contentType }
    }
  }
  return null
}

async function get(url: string, maxBytes: number): Promise<{ body: ArrayBuffer; contentType: string; url: string } | null> {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MILLISECONDS),
      cache: 'no-store',
    })
    if (!response.ok) return null
    const body = await response.arrayBuffer()
    if (body.byteLength > maxBytes) return null
    return { body, contentType: (response.headers.get('content-type') ?? '').toLowerCase(), url: response.url }
  } catch {
    return null
  }
}
