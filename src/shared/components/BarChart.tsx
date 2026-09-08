import * as styles from './BarChart.css'

export type BarTheme = (typeof styles.BAR_THEMES)[number]

export interface BarChartData {
  /** 막대 길이를 정하는 값. */
  value: number
  /** 이 막대가 가득 찬 것으로 볼 값. 주지 않으면 데이터 전체의 최댓값으로 잡는다. */
  maxValue?: number
  /** 막대 아래 이름표. */
  label?: string
  theme?: BarTheme
  /** 막대 위에 얹는 글자나 숫자. */
  barAnnotation?: string | number
  /**
   * 마우스를 올렸을 때 나오는 설명. TDS에는 없는 우리 추가분이다 —
   * 막대 하나가 여러 숫자를 품는 경우(전체·공개·숨김) 그 내역을 둘 자리가 달리 없다.
   */
  title?: string
}

/** 모든 막대를 한 색으로. */
interface AllBar {
  type: 'all-bar'
  theme: BarTheme
}

/** 한 막대만 짚어서 다른 색으로. 나머지는 회색으로 물러난다. */
interface SingleBar {
  type: 'single-bar'
  barIndex: number
  theme: BarTheme
}

interface BarChartProps {
  data: BarChartData[]
  fill: AllBar | SingleBar
  /** 차트 전체 높이(px). TDS와 같은 기본값 205다. */
  height?: number
}

const DEFAULT_HEIGHT = 205

/**
 * TDS Mobile의 BarChart를 본뜬 세로 막대 차트.
 *
 * 축과 눈금은 두지 않는다 — TDS도 그렇고, 막대 위에 숫자(barAnnotation)가 붙어 있으면
 * 눈금을 세는 일이 없다. 범례도 없다. 무엇을 세는 차트인지는 바깥 제목이 말한다.
 *
 * TDS의 세 번째 fill인 `{ type: 'auto', count }`는 옮기지 않았다. 문서가 "색이 오른쪽에서
 * 왼쪽으로 순서대로 붙는다"고만 적고 count와의 관계를 정하지 않아, 짐작해서 같은 이름을 달면
 * 진짜 TDS로 갈아탈 때 색이 조용히 달라진다 — 필요해지면 그때 문서를 확인하고 더한다.
 */
export function BarChart({ data, fill, height = DEFAULT_HEIGHT }: BarChartProps) {
  if (data.length === 0) return null

  // maxValue를 안 준 막대들의 기준. 0으로 나누지 않도록 최소 1로 받친다.
  const fallbackMax = Math.max(1, ...data.map((item) => item.value))

  return (
    <div className={styles.chart} style={{ height }}>
      {data.map((item, index) => {
        const max = item.maxValue ?? fallbackMax
        const ratio = max <= 0 ? 0 : Math.min(1, item.value / max)
        const theme =
          item.theme ??
          (fill.type === 'all-bar' ? fill.theme : index === fill.barIndex ? fill.theme : 'grey')

        return (
          <div
            // label이 없거나 겹칠 수 있어 인덱스를 함께 쓴다 — 순서가 곧 이 차트의 정체성이다.
            key={`${item.label ?? ''}-${index}`}
            className={styles.column}
            title={item.title}
          >
            {item.barAnnotation !== undefined && (
              <span className={styles.annotation}>{item.barAnnotation}</span>
            )}
            {/* 막대는 그림이다 — 값은 위 숫자와 아래 이름표가 이미 말한다. */}
            <div className={styles.track} aria-hidden="true">
              <div
                className={`${styles.bar} ${styles.barTheme[theme]}`}
                style={{ height: `${ratio * 100}%` }}
              />
            </div>
            {item.label && <span className={styles.label}>{item.label}</span>}
          </div>
        )
      })}
    </div>
  )
}
