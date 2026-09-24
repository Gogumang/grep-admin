import 'server-only'

/**
 * 사이트 이벤트 페이지가 읽는 행사 목록. collector가 매일 티켓타코를 읽어 grep 저장소에 쓴 것이다.
 *
 * collector를 거치지 않고 저장소 파일을 바로 읽는다. 행사는 DB에 없고(collector가 매일 통째로 다시 쓴다)
 * 저장소가 공개라 토큰도 필요 없다 — 읽기 전용 화면 하나에 collector API를 늘릴 이유가 없다.
 */
const SITE_REPOSITORY_RAW = 'https://raw.githubusercontent.com/Gogumang/grep/main'
/** 사이트가 행사 이미지를 서비스하는 주소. 이미지는 저장소 public/events 에 있다. */
const SITE_ORIGIN = 'https://grep.gogumang.com'

const REQUEST_TIMEOUT_MS = 10_000
/** raw.githubusercontent 는 5분 캐시라 더 자주 읽어도 같은 값이다. */
const REVALIDATE_SECONDS = 300

export interface SiteEvent {
  /** 티켓타코 행사 코드. */
  id: string
  title: string
  url: string
  host: string
  /** YYYY-MM-DD */
  startDate: string
  /** HH:mm. 없으면 null. */
  startTime: string | null
  /** YYYY-MM-DD */
  endDate: string
  place: string | null
  isOnline: boolean
  lowestPrice: number | null
  highestPrice: number | null
  /** 사이트 이벤트 페이지에 실제로 나가는 행사인가 (featured.ts 에 적힌 것). */
  isFeatured: boolean
  /** 사이트에 올린 행사의 이미지. 올리지 않은 행사는 null. */
  imageUrl: string | null
}

async function readSiteFile(path: string): Promise<string> {
  const response = await fetch(`${SITE_REPOSITORY_RAW}/${path}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!response.ok) throw new Error(`사이트 저장소의 ${path} 를 읽지 못했습니다 (HTTP ${response.status})`)
  return response.text()
}

/**
 * featured.ts 에서 올린 행사의 id와 이미지 경로를 꺼낸다.
 *
 * TS 파일을 정규식으로 읽는 이유 — 사이트 빌드에 맞춰 쓴 설정 파일이라 JSON으로 따로 두면 두 곳을 고쳐야 한다.
 * `{ id: '...', image: '...' }` 모양이 바뀌면 여기서 0건이 되므로, 그때는 화면이 "올린 행사 없음"으로 보인다.
 */
export function parseFeatured(source: string): Map<string, string> {
  const featured = new Map<string, string>()
  for (const [, id, image] of source.matchAll(/id:\s*'([^']+)',\s*image:\s*'([^']+)'/g)) {
    if (id && image) featured.set(id, image)
  }
  return featured
}

export async function listSiteEvents(): Promise<SiteEvent[]> {
  const [eventsSource, featuredSource] = await Promise.all([
    readSiteFile('src/events/events.json'),
    readSiteFile('src/events/config/featured.ts'),
  ])
  const featured = parseFeatured(featuredSource)
  const { events } = JSON.parse(eventsSource) as { events: Omit<SiteEvent, 'isFeatured' | 'imageUrl'>[] }

  return events
    .map((event) => {
      const image = featured.get(event.id)
      return { ...event, isFeatured: image !== undefined, imageUrl: image ? `${SITE_ORIGIN}${image}` : null }
    })
    .sort((left, right) => left.startDate.localeCompare(right.startDate))
}
