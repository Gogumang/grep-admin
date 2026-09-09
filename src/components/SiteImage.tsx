'use client'

import { useEffect, useRef, useState } from 'react'
import { toSiteImage, type SiteImage as SiteImageSource } from '@/lib/site'

/**
 * 공개 사이트에 올라간 이미지를 어드민에서 그린다.
 *
 * 사이트는 이미지를 avif로 다시 굽지만 굽지 못한 글은 원본만 남는다 (2026-09-09 기준 398개 중 3개).
 * 어느 쪽이 남아 있는지는 받아 봐야 알 수 있어서, 변환본을 먼저 걸고 404면 원본으로 물러난다.
 * 둘 다 없으면 깨진 아이콘 대신 같은 크기의 회색 자리를 남긴다 — 자리가 흔들리면
 * 옆 글의 제목 줄까지 밀린다.
 */
export function SiteImage({
  thumbnail,
  className,
  alt = '',
  width,
  height,
  source,
  eager = false,
}: {
  thumbnail?: string | null
  /** 이미 만들어 둔 주소가 있을 때 (히어로처럼 규칙이 다른 경우). */
  source?: SiteImageSource | null
  className?: string
  alt?: string
  width?: number
  height?: number
  /**
   * 화면에 들어오기를 기다리지 않고 바로 받는다. 처음부터 보이는 큰 그림에만 쓴다 —
   * 히어로를 늦게 받으면 화면이 열리자마자 빈 상자가 보인다.
   */
  eager?: boolean
}) {
  const [failedUrls, setFailedUrls] = useState<string[]>([])
  const imageRef = useRef<HTMLImageElement | null>(null)

  const image = source !== undefined ? source : toSiteImage(thumbnail)
  const candidates = image ? [image.url, image.fallbackUrl].filter((url): url is string => url !== null) : []
  // 실패한 주소를 기억해 두고 다음 후보로 넘어간다 — 기억하지 않으면 두 주소를 오가며 무한히 다시 받는다.
  const resolved = candidates.find((url) => !failedUrls.includes(url)) ?? null

  /**
   * 서버에서 그려진 <img>는 브라우저가 자바스크립트를 붙이기 전에 이미 받아 보고 실패한다 —
   * 그때는 onError가 오지 않아 물러설 기회를 놓친다. 붙는 순간 그 한 장의 결과만 직접 본다.
   *
   * 물러선 뒤의 주소까지 여기서 다시 보면 안 된다. 주소를 막 바꾼 <img>는 아직 앞선 실패의
   * 흔적(complete=true, naturalWidth=0)을 들고 있어서, 멀쩡한 원본까지 실패로 찍어 버린다.
   * 두 번째 장부터는 브라우저가 onError를 제대로 보내준다.
   */
  useEffect(() => {
    const element = imageRef.current
    if (!element || !element.complete || element.naturalWidth > 0) return
    markFailed(element.src)
    // 서버가 그린 첫 장만 본다 — deps를 비워 두는 것이 그 뜻이다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function markFailed(url: string) {
    setFailedUrls((previous) => (previous.includes(url) ? previous : [...previous, url]))
  }

  if (!resolved) return <div className={className} />

  return (
    <img
      ref={imageRef}
      className={className}
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      /*
       * 목록은 스크롤을 내리는 만큼 카드가 쌓인다 — 전부 즉시 받으면 100개를 지난
       * 시점에 화면 밖 사진 수십 장을 함께 내려받느라 방금 보이기 시작한 카드가 늦는다.
       * 자리 크기는 CSS(aspectRatio)가 잡고 있어서 늦게 와도 글이 밀리지 않는다.
       */
      loading={eager ? 'eager' : 'lazy'}
      // 디코딩까지 기다리며 화면을 멈추지 않는다.
      decoding="async"
      onError={() => markFailed(resolved)}
    />
  )
}
