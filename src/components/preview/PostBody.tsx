'use client'

import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

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
    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
      {body}
    </Markdown>
  )
}
