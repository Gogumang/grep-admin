'use client'

import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { SiteImage } from '@/components/SiteImage'

/**
 * grep(사이트)의 components/post/PostBody.tsx 와 같은 렌더러다.
 *
 * 플러그인 구성이 다르면 미리보기와 실제 화면이 달라진다 — 표가 안 그려지거나
 * 코드 하이라이트가 빠진다. 사이트에서 플러그인을 바꾸면 여기도 함께 바꿔야 한다.
 *
 * HTML을 직접 넣지 않는 것도 사이트와 같다. 남의 페이지에서 가져온 내용이라
 * 스크립트가 섞이면 안 된다.
 */
export function PostBody({ body }: { body: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        /*
         * 본문 이미지는 R2의 절대 주소다. 썸네일과 같은 SiteImage 를 통과시킨다 —
         * 수집 때 옮긴 이미지는 avif 변환본 없이 원본 확장자(01.png)로만 올라가 있어서,
         * avif 주소만 걸면 카카오·여기어때 글의 본문 이미지가 어드민에서 전부 404였다
         * (2026-09-16 확인). SiteImage 는 avif 가 404면 원본으로 물러난다.
         * 지연 로딩도 SiteImage 가 한다 — 글 한 편에 사진이 열 장 가까이 붙는다.
         */
        img: ({ src, alt }) => {
          // 주소가 없으면 깨진 이미지 아이콘 대신 아무것도 그리지 않는다.
          if (typeof src !== 'string' || !src) return null
          return <SiteImage thumbnail={src} alt={alt ?? ''} />
        },
      }}
    >
      {body}
    </Markdown>
  )
}
