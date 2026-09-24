import { SiteImage } from '@/components/SiteImage'
import * as styles from './BlogIcon.css'

/**
 * 블로그 옆에 붙일 회사 아이콘. scripts/fetch-blog-icons.py 가 받아 public/blog-icons 에 둔 것이다.
 *
 * 남의 사이트 favicon.ico를 화면에서 바로 부르지 않는 이유 — HTML을 주거나 404가 나거나
 * (Medium 블로그는) 전부 같은 Medium 로고가 나와서 회사를 알아볼 수 없었다.
 * 방금 추가해 아직 받지 않은 블로그는 회색 자리로 남는다 — 스크립트를 다시 돌려 채운다.
 */
export function BlogIcon({ blogKey, size }: { blogKey: string; size: number }) {
  return (
    <SiteImage
      source={{ url: `/blog-icons/${encodeURIComponent(blogKey)}.png`, fallbackUrl: null }}
      className={styles.blogIcon}
      width={size}
      height={size}
    />
  )
}
