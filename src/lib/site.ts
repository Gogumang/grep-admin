/**
 * 공개 사이트 주소.
 *
 * collector가 주는 썸네일은 사이트 기준 상대 경로다 (예: /images/00b4548e8f.png).
 * 어드민에서 그대로 <img src>에 넣으면 어드민 주소로 풀려 404가 난다.
 *
 * 브라우저가 직접 이미지를 받아오므로 NEXT_PUBLIC_ 이어야 한다 — 서버 전용 값은
 * 클라이언트 컴포넌트에서 undefined 가 된다.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

/**
 * 사이트가 avif로 다시 굽는 확장자들.
 *
 * collector는 원본 확장자를 그대로 들고 있는데 사이트는 받아 온 이미지를 avif로 변환해
 * 올린다. 그래서 collector 주소를 그대로 걸면 어드민에서만 전부 깨진다 —
 * 2026-09-09 실측으로 상대 경로 썸네일 385개 중 385개가 404, .avif로 바꾸면 382개가 200이었다.
 */
const CONVERTED_EXTENSION = /\.(png|jpe?g|gif|webp)$/i

export interface SiteImage {
  /** 사이트가 실제로 서비스하는 주소. 대부분 avif 변환본이다. */
  url: string
  /**
   * 변환본이 없어 원본만 올라간 글을 위한 주소 (2026-09-09 기준 3건).
   * url이 404일 때만 쓴다 — 어느 쪽이 남아 있는지는 받아 봐야 알 수 있다.
   */
  fallbackUrl: string | null
}

function toAbsolute(path: string): string | null {
  if (/^https?:\/\//i.test(path)) return path
  if (!siteUrl) return null

  const base = siteUrl.replace(/\/$/, '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

/**
 * 썸네일을 브라우저가 받을 수 있는 주소로 만든다. 변환본과 원본 두 벌을 함께 준다.
 *
 * 없으면 예외를 던지지 않고 null을 준다 — 썸네일은 보조 데이터라, 주소 하나 때문에
 * 목록 전체가 막히면 안 된다. 대신 회색 자리가 남아 빠진 것이 눈에 보인다.
 */
export function toSiteImage(thumbnail: string | null | undefined): SiteImage | null {
  if (!thumbnail) return null

  // 남의 서버에 있는 이미지는 우리가 굽지 않았다 — 확장자를 건드리면 멀쩡한 주소가 깨진다.
  if (/^https?:\/\//i.test(thumbnail)) return { url: thumbnail, fallbackUrl: null }

  const original = toAbsolute(thumbnail)
  if (!original) return null

  if (!CONVERTED_EXTENSION.test(thumbnail)) return { url: original, fallbackUrl: null }

  const converted = toAbsolute(thumbnail.replace(CONVERTED_EXTENSION, '.avif'))
  return converted ? { url: converted, fallbackUrl: original } : { url: original, fallbackUrl: null }
}

/** 한 벌만 필요한 곳(마크다운 본문 이미지)을 위한 지름길. */
export function toSiteImageUrl(thumbnail: string | null | undefined): string | null {
  return toSiteImage(thumbnail)?.url ?? null
}

/**
 * 히어로에 거는 1200×630 이미지.
 *
 * 사이트의 content.ts가 `sourceThumbnail ?? /thumbnails/{id}-og.png` 로 만드는 값을
 * 그대로 옮긴 것이다 — 원문 이미지가 없는 글은 collector가 구운 OG 이미지가 걸린다.
 * 어드민이 sourceThumbnail 만 보고 빈 상자를 그리면, 정작 이미지가 없는 글에서
 * 미리보기와 실제 화면이 가장 크게 갈라진다.
 */
export function toSiteWideImage(postId: string, sourceThumbnail: string | null | undefined): SiteImage | null {
  return toSiteImage(sourceThumbnail ?? `/thumbnails/${postId}-og.png`)
}
