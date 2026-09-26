import { SiteImage } from '@/components/SiteImage'
import * as styles from './BlogIcon.css'

/**
 * 블로그 옆에 붙일 회사 아이콘. scripts/fetch-blog-icons.py 가 받아 public/blog-icons 에 둔 것이다.
 *
 * 남의 사이트 favicon.ico를 화면에서 바로 부르지 않는 이유 — HTML을 주거나 404가 나거나
 * (Medium 블로그는) 전부 같은 Medium 로고가 나와서 회사를 알아볼 수 없었다.
 * 방금 추가해 아직 굳히지 않은 블로그는 서버가 그 사이트의 아이콘을 찾아 대신 보인다 — 스크립트로 굳히면 그 파일이 먼저다.
 * Medium 처럼 여러 회사가 얹힌 곳은 찾지 않고 회색 자리로 둔다(호스팅 로고가 나온다) — 스크립트의 SITE_OVERRIDES 에 적어 굳힌다.
 */
export function BlogIcon({ blogKey, size }: { blogKey: string; size: number }) {
  return (
    <SiteImage
      source={{
        url: `/blog-icons/${encodeURIComponent(blogKey)}.png`,
        // 아직 굳히지 않은 블로그는 서버가 사이트에서 찾아 준다 (app/blogs/icon/[blogKey]).
        fallbackUrl: `/blogs/icon/${encodeURIComponent(blogKey)}`,
      }}
      className={styles.blogIcon}
      width={size}
      height={size}
    />
  )
}
