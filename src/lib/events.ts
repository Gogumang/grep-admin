import 'server-only'
import { collector } from './collector'

/**
 * 사이트 이벤트 페이지가 읽는 행사 목록. collector가 매일 판매처(티켓타코·이벤터스)와 Dev-Event(해커톤)를 읽어 grep 저장소에 쓴 것이다.
 *
 * 모은 행사 목록은 저장소 파일을 바로 읽는다. 행사는 DB에 없고(collector가 매일 통째로 다시 쓴다)
 * 저장소가 공개라 토큰도 필요 없다.
 */
const SITE_REPOSITORY_RAW = 'https://raw.githubusercontent.com/Gogumang/grep/main'
/** 사이트가 행사 이미지를 서비스하는 주소. 이미지는 저장소 public/events 에 있다. */
const SITE_ORIGIN = 'https://grep.gogumang.com'

const REQUEST_TIMEOUT_MS = 10_000
/** raw.githubusercontent 는 5분 캐시라 더 자주 읽어도 같은 값이다. */
const REVALIDATE_SECONDS = 300

/** 행사를 가져온 곳. collector 의 EventSourceKind.label 과 같아야 한다. */
export type EventSourceLabel = '티켓타코' | '이벤터스' | 'Dev-Event'

export interface SiteEvent {
  /** 티켓타코는 행사 코드, 이벤터스는 eventus-{번호}, Dev-Event 는 dev-event-{주소 해시 12자}. */
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
  /** 판매처. collector 가 이 필드를 싣기 전의 파일에는 없고, 그때는 티켓타코뿐이었다. */
  source?: EventSourceLabel
  /** 사이트 이벤트 페이지에 실제로 나가는 행사인가 (featured.ts 에 적힌 것). */
  isFeatured: boolean
  /** 사이트에 올린 행사의 이미지. 올리지 않은 행사는 null — 검증 화면은 여기에 수집 때 찾아 둔 이미지를 채워 그린다. */
  imageUrl: string | null
}

/** 예전에 손으로 올린 행사는 사이트 기준 경로다. 어드민은 다른 도메인이라 사이트 주소를 붙인다. */
function toAbsoluteImage(image: string): string {
  return image.startsWith('https://') ? image : `${SITE_ORIGIN}${image}`
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
 * 모은 행사는 저장소 파일에서, 올린 행사는 collector에서 읽는다. 올린 목록까지 저장소에서 읽으면
 * raw.githubusercontent 5분 캐시 때문에 방금 올린 행사가 한동안 안 올린 것으로 보인다.
 */
export async function listSiteEvents(): Promise<SiteEvent[]> {
  const [eventsSource, featuredEvents] = await Promise.all([
    readSiteFile('src/events/events.json'),
    collector.listFeaturedEvents(),
  ])
  const imageById = new Map(featuredEvents.map((featured) => [featured.id, featured.image]))
  const { events } = JSON.parse(eventsSource) as { events: Omit<SiteEvent, 'isFeatured' | 'imageUrl'>[] }

  return events
    .map((event) => {
      const image = imageById.get(event.id)
      return { ...event, isFeatured: image !== undefined, imageUrl: image ? toAbsoluteImage(image) : null }
    })
    .sort((left, right) => left.startDate.localeCompare(right.startDate))
}

/** 오늘(서울). 끝난 행사를 가르는 기준이다 — 서버가 UTC로 돌아서 그냥 쓰면 아침 아홉 시 전까지 하루가 밀린다. */
export function todayInSeoul(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}
