import { collector, type Post } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as styles from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { PostManager, type PostListItem } from './PostManager'

export const dynamic = 'force-dynamic'

/**
 * 목록이 쓰는 필드만 골라낸다.
 *
 * Post 를 통째로 넘기면 화면이 읽지도 않는 summary·url·blogKey·tags 가 398건분
 * 브라우저까지 따라간다 — 2026-09-10 실측으로 160KB 중 72KB가 그 몫이었다.
 *
 * PostManager 가 아니라 여기(서버)에 두는 이유 — 'use client' 모듈이 내보낸 함수는
 * 클라이언트 참조라서 서버에서 부를 수 없다. 타입은 erase 되므로 PostListItem 을
 * 가져오는 것은 괜찮다.
 */
function toPostListItem(post: Post): PostListItem {
  return {
    id: post.id,
    title: post.title,
    blogName: post.blogName,
    publishedAt: post.publishedAt,
    sourceThumbnail: post.sourceThumbnail,
    hidden: post.hidden,
    recentViews: post.recentViews,
    totalViews: post.totalViews,
  }
}

export default async function PostsPage() {
  await requireAdmin()

  try {
    // 숨긴 글까지 전부 읽는다 — 어드민은 숨긴 것을 다시 드러낼 수 있어야 한다.
    const posts = await collector.listPosts()
    return (
      <>
        <h1 className={console.pageTitle}>글</h1>
        <PostManager posts={posts.map(toPostListItem)} />
      </>
    )
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>글</h1>
        <p className={styles.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
