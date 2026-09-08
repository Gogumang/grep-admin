import { ArticlePreview } from '@/components/preview/ArticlePreview'
import { Badge } from '@/shared'
import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from './postDetail.css'

export const dynamic = 'force-dynamic'

/**
 * 이미 나간 글 하나를 미리보는 자리.
 *
 * 목록에서 제목을 누르면 원문 블로그로 가던 것을 여기로 돌렸다 — 어드민에서 알고 싶은 것은
 * "원문이 어떻게 생겼나"가 아니라 "우리 사이트에 어떻게 나갔나"다. 원문은 아래 링크로 남긴다.
 *
 * 사이트의 글 페이지로 보내지 않는 이유 — 숨긴 글은 사이트가 빌드하지 않아 404이고,
 * 방금 공개한 글은 다음 배포 전까지 없다. 정작 확인이 필요한 두 경우가 안 보인다.
 */
export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  await requireAdmin()
  const { postId } = await params

  try {
    const { post, body } = await collector.findPost(postId)
    return (
      <>
        <a href="/posts" className={styles.backLink}>
          ⬅️ 글 목록
        </a>
        <div className={styles.titleRow}>
          <h1 className={console.pageTitle}>{post.title}</h1>
          {post.hidden && (
            <Badge color="red" variant="weak" size="small">
              숨김
            </Badge>
          )}
          <a className={styles.sourceLink} href={post.url} target="_blank" rel="noopener noreferrer">
            원문 보기 ↗
          </a>
        </div>

        <div className={styles.panel}>
          {/* onChange를 주지 않으므로 읽기 전용이다 — 공개된 글은 여기서 고치지 않는다. */}
          <ArticlePreview
            draft={{
              title: post.title,
              summary: post.summary,
              sourceThumbnail: post.sourceThumbnail ?? '',
              tags: post.tags.join(', '),
              body: body ?? '',
            }}
            blogName={post.blogName}
            publishedAt={post.publishedAt}
          />
        </div>
      </>
    )
  } catch (error) {
    // 목록을 띄운 뒤 지워졌을 수 있다. 목록으로 돌아갈 길을 함께 준다.
    return (
      <>
        <a href="/posts" className={styles.backLink}>
          ⬅️ 글 목록
        </a>
        <h1 className={console.pageTitle}>글</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
