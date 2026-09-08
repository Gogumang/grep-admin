import * as styles from './Loader.css'

export type LoaderSize = 'small' | 'medium' | 'large'

/**
 * 도는 원 하나. TDS의 Loader 자리다.
 *
 * 기다리는 중임을 스크린리더에도 알려야 하므로 role="status"를 단다 — 그림만 도는 화면은
 * 소리로 읽으면 아무 일도 일어나지 않는 빈 화면이다.
 */
export function Loader({ size = 'medium', label = '불러오는 중' }: { size?: LoaderSize; label?: string }) {
  return (
    <span className={[styles.loader, styles.size[size]].join(' ')} role="status" aria-label={label} />
  )
}

/** 패널·페이지 가운데 세운 Loader. 목록이 오기 전 자리를 지킨다. */
export function LoaderBlock({ size = 'medium', label }: { size?: LoaderSize; label?: string }) {
  return (
    <div className={styles.center}>
      <Loader size={size} label={label} />
    </div>
  )
}
