'use client'

import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { toSiteImageUrl } from '@/lib/site'

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
         * 본문 이미지는 사이트 기준 상대 경로다 (/images/{글id}/01.avif).
         * 사이트에서는 그대로 맞지만 어드민에서 그리면 어드민 주소로 풀려 전부 404가 난다 —
         * 썸네일이 toSiteImageUrl 을 거치는 것과 같은 이유인데 본문만 빠져 있었다.
         */
        img: ({ src, alt, ...rest }) => {
          const resolved = toSiteImageUrl(typeof src === 'string' ? src : null)
          // 주소를 만들지 못하면 깨진 이미지 아이콘 대신 아무것도 그리지 않는다.
          if (!resolved) return null
          return <img {...rest} src={resolved} alt={alt ?? ''} />
        },
      }}
    >
      {body}
    </Markdown>
  )
}
