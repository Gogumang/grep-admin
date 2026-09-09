/**
 * 공개 사이트 주소.
 *
 * collector가 주는 썸네일은 사이트 기준 상대 경로다 (예: /images/00b4548e8f.avif).
 * 어드민에서 그대로 <img src>에 넣으면 어드민 주소로 풀려 404가 난다.
 *
 * 브라우저가 직접 이미지를 받아오므로 NEXT_PUBLIC_ 이어야 한다 — 서버 전용 값은
 * 클라이언트 컴포넌트에서 undefined 가 된다.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

/**
 * 썸네일 주소를 브라우저가 받을 수 있는 형태로 만든다.
 *
 * 없으면 예외를 던지지 않고 null을 준다 — 썸네일은 보조 데이터라, 주소 하나 때문에
 * 목록 전체가 막히면 안 된다. 대신 회색 자리가 남아 빠진 것이 눈에 보인다.
 */
export function toSiteImageUrl(thumbnail: string | null | undefined): string | null {
  if (!thumbnail) return null

  // 이미 절대 주소면 그대로 둔다 — collector가 두 형태를 섞어 줄 수 있고,
  // 무조건 앞에 붙이면 멀쩡한 주소를 깨뜨린다.
  if (/^https?:\/\//i.test(thumbnail)) return thumbnail

  if (!siteUrl) return null

  const base = siteUrl.replace(/\/$/, '')
  return thumbnail.startsWith('/') ? `${base}${thumbnail}` : `${base}/${thumbnail}`
}

/**
 * 히어로에 거는 1200×630 이미지 주소.
 *
 * 사이트의 content.ts가 `sourceThumbnail ?? /thumbnails/{id}-og.png` 로 만드는 값을
 * 그대로 옮긴 것이다 — 원문 이미지가 없는 글은 collector가 구운 OG 이미지가 걸린다.
 * 어드민이 sourceThumbnail 만 보고 빈 상자를 그리면, 정작 이미지가 없는 글에서
 * 미리보기와 실제 화면이 가장 크게 갈라진다.
 *
 * 목록 카드용 400×220은 `/thumbnails/{id}.png` 로 규칙이 다르다. 지금 어드민이 카드를
 * 그릴 때는 sourceThumbnail 을 쓰므로 여기서는 히어로용만 만든다.
 */
export function toSiteWideImageUrl(postId: string, sourceThumbnail: string | null | undefined): string | null {
  return toSiteImageUrl(sourceThumbnail ?? `/thumbnails/${postId}-og.png`)
}
