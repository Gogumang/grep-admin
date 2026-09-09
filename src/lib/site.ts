/**
 * 우리가 구워서 올린 이미지를 서비스하는 R2 커스텀 도메인.
 *
 * collector가 공개 시점에 이미지를 R2로 올리고, 썸네일과 본문에 이 도메인의 절대 주소를
 * 남긴다. 예전에는 사이트 기준 상대 경로(/images/...)였는데, 어드민이 사이트와 다른
 * 도메인에서 돌기 때문에 어드민에서만 전부 404가 났다 — 절대 주소가 되면서 주소를
 * 사이트 기준으로 다시 푸는 계층 자체가 없어졌다.
 *
 * 사이트(grep)의 scripts/fetchImages.mjs 의 R2_PUBLIC_BASE_URL,
 * collector의 collector.r2.public-base-url 과 같은 값이어야 한다. 이 셋이 갈리면
 * 어드민에서만 썸네일이 깨진다 — 옮길 일이 생기면 세 곳을 함께 고친다.
 *
 * 환경변수로 두지 않는 이유 — 시크릿이 아니라 공개 주소이고 버킷도 하나뿐인데,
 * 환경변수로 두면 값을 빠뜨린 배포가 조용히 다른 주소로 돌 자리만 생긴다.
 */
const IMAGE_ORIGIN = 'https://images.gogumang.com'

/**
 * R2에 avif 변환본으로 올라가 있는 확장자들.
 *
 * collector는 원문이 준 확장자(.png/.jpg)를 그대로 들고 있는데, R2에 실제로 올라간 것은
 * avif 변환본이다. 그래서 collector가 준 주소를 그대로 걸면 어드민에서만 전부 깨진다 —
 * 2026-09-09 실측으로 R2 썸네일 385개 중 378개가 준 주소 그대로는 404였고 .avif 로
 * 바꾸면 200이었다. 반대로 avif가 없고 원본만 남은 글도 3개 있어서, 둘 다 들고 다닌다.
 */
const CONVERTED_EXTENSION = /\.(png|jpe?g|gif|webp)$/i

export interface SiteImage {
  /** R2가 실제로 서비스하는 주소. 대부분 avif 변환본이다. */
  url: string
  /**
   * 변환본이 없어 원본만 올라간 글을 위한 주소 (2026-09-09 기준 3건).
   * url이 404일 때만 쓴다 — 어느 쪽이 남아 있는지는 받아 봐야 알 수 있다.
   */
  fallbackUrl: string | null
}

/**
 * 이미지 주소를 브라우저가 받을 수 있는 형태로 만든다. 변환본과 원본 두 벌을 함께 준다.
 *
 * 없으면 예외를 던지지 않고 null을 준다 — 썸네일은 보조 데이터라, 주소 하나 때문에
 * 목록 전체가 막히면 안 된다. 대신 회색 자리가 남아 빠진 것이 눈에 보인다.
 */
export function toSiteImage(thumbnail: string | null | undefined): SiteImage | null {
  if (!thumbnail) return null

  /*
   * 우리 R2에 있는 것만 확장자를 건드린다.
   *
   * 검토 대기 글은 아직 원문 CDN 주소를 그대로 들고 있다 (예: cdn-images-1.medium.com).
   * 남의 서버 이미지는 우리가 굽지 않았으니, .avif 로 바꾸면 멀쩡한 주소가 깨진다.
   */
  if (!thumbnail.startsWith(`${IMAGE_ORIGIN}/`)) return { url: thumbnail, fallbackUrl: null }

  // 이미 변환본 주소인 글도 있다 (본문 이미지는 전부 이쪽이다).
  if (!CONVERTED_EXTENSION.test(thumbnail)) return { url: thumbnail, fallbackUrl: null }

  return { url: thumbnail.replace(CONVERTED_EXTENSION, '.avif'), fallbackUrl: thumbnail }
}

/** 한 벌만 필요한 곳(마크다운 본문 이미지)을 위한 지름길. */
export function toSiteImageUrl(thumbnail: string | null | undefined): string | null {
  return toSiteImage(thumbnail)?.url ?? null
}
