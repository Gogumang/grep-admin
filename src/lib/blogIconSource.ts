/**
 * 블로그 아이콘을 어디서 받을지 고른다. 네트워크를 모르는 순수 함수라 HTML 문자열만으로 정해진다.
 *
 * scripts/fetch-blog-icons.py 와 같은 순서다 — 첫 화면이 선언한 아이콘을 큰 것부터, 없으면 /favicon.ico.
 * 남의 사이트 /favicon.ico 만 바로 부르지 않는 이유는 그 스크립트 머리말에 있다(HTML·404·다른 경로).
 */

/**
 * 여러 회사 블로그를 얹는 곳. 여기서 받은 아이콘은 회사가 아니라 호스팅 서비스 로고라(Medium 이면 전부 같은 M)
 * 회사를 알아볼 수 없다 — 틀린 로고보다 빈 자리가 낫다. 이런 블로그는 스크립트의 SITE_OVERRIDES 에 회사 사이트를 적어 굳힌다.
 */
const HOSTING_PLATFORM_HOSTS = ['medium.com', 'feedburner.com', 'tistory.com', 'blogspot.com', 'velog.io', 'brunch.co.kr']

export function isHostingPlatform(url: string): boolean {
  const host = hostOf(url)
  return host !== null && HOSTING_PLATFORM_HOSTS.some((platform) => host === platform || host.endsWith(`.${platform}`))
}

/** 아이콘을 찾을 첫 화면. 피드 주소가 아니라 사이트 주소다 — collector 가 비워 두면 피드 주소의 도메인을 쓴다. */
export function siteUrlOf(homepageUrl: string, feedUrl: string): string | null {
  if (resolve(homepageUrl, homepageUrl || 'invalid:')) return homepageUrl
  try {
    const feed = new URL(feedUrl)
    return feed.protocol === 'https:' || feed.protocol === 'http:' ? feed.origin : null
  } catch {
    return null
  }
}

const LINK_TAG = /<link\b[^>]*>/gi
const ATTRIBUTE = /([\w-]+)\s*=\s*["']([^"']*)["']/g

/** 첫 화면 HTML 이 선언한 아이콘(큰 것부터) 다음에 /favicon.ico. http(s) 주소만 돌려준다. */
export function iconCandidates(homepageHtml: string, pageUrl: string): string[] {
  const declared: { size: number; url: string }[] = []
  for (const tag of homepageHtml.match(LINK_TAG) ?? []) {
    const attributes: Record<string, string> = {}
    for (const [, name = '', value = ''] of tag.matchAll(ATTRIBUTE)) attributes[name.toLowerCase()] = decodeEntities(value)
    if (!attributes.rel?.toLowerCase().includes('icon') || !attributes.href) continue
    const sizes = [...(attributes.sizes ?? '').matchAll(/(\d+)x\d+/g)].map(([, side = '0']) => Number(side))
    const resolved = resolve(attributes.href, pageUrl)
    if (resolved) declared.push({ size: Math.max(0, ...sizes), url: resolved })
  }
  const favicon = resolve('/favicon.ico', pageUrl)
  const ordered = declared.sort((left, right) => right.size - left.size).map((icon) => icon.url)
  return [...new Set([...ordered, ...(favicon ? [favicon] : [])])]
}

function resolve(href: string, base: string): string | null {
  try {
    const url = new URL(href, base)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

function decodeEntities(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}
