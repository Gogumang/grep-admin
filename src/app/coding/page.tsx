import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import { Badge, Button } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from './coding.css'

export const dynamic = 'force-dynamic'

function formatDateTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 코딩테스트 문제 목록. 문제 원본과 숨은 케이스는 collector(비공개)에만 있다 —
 * 사이트 저장소는 공개라서, 공개한 문제의 지문·예시만 collector 가 problems.json 으로 커밋한다.
 */
export default async function CodingProblemsPage() {
  await requireAdmin()

  const header = (title: string) => (
    <div className={styles.titleRow}>
      <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>{title}</h1>
      <span className={styles.pushRight}>
        <Button as="a" href="/coding/new" color="primary" variant="weak" size="small">
          새 문제
        </Button>
      </span>
    </div>
  )

  try {
    const problems = await collector.listCodingProblems()
    const publishedCount = problems.filter((problem) => problem.status === 'published').length
    return (
      <>
        {header(`문제 ${problems.length}개 · 공개 ${publishedCount}개`)}
        {problems.length === 0 ? (
          <p className={shared.mutedText}>아직 문제가 없습니다. 새 문제를 만들어 주세요.</p>
        ) : (
          <div className={shared.card}>
            <table className={shared.table}>
              <thead>
                <tr>
                  <th className={shared.tableHead}>제목</th>
                  <th className={shared.tableHead}>난이도</th>
                  <th className={shared.tableHead}>태그</th>
                  <th className={shared.tableHead}>상태</th>
                  <th className={shared.tableHead}>예시</th>
                  <th className={shared.tableHead}>숨은</th>
                  <th className={shared.tableHead}>고친 때</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id}>
                    <td className={shared.tableCell}>
                      <a className={styles.problemLink} href={`/coding/${encodeURIComponent(problem.id)}`}>
                        {problem.title}
                      </a>
                      <div className={shared.mutedText}>{problem.id}</div>
                    </td>
                    <td className={`${shared.tableCell} ${styles.numberCell}`}>Lv. {problem.level}</td>
                    <td className={shared.tableCell}>
                      <span className={styles.tagList}>
                        {problem.tags.map((tag) => (
                          <Badge key={tag} color="teal" variant="weak" size="xsmall">
                            {tag}
                          </Badge>
                        ))}
                      </span>
                    </td>
                    <td className={shared.tableCell}>
                      <Badge color={problem.status === 'published' ? 'green' : 'elephant'} variant="weak" size="small">
                        {problem.status === 'published' ? '공개' : '초안'}
                      </Badge>
                    </td>
                    <td className={`${shared.tableCell} ${styles.numberCell}`}>{problem.exampleCount}</td>
                    <td className={`${shared.tableCell} ${styles.numberCell}`}>{problem.hiddenCaseCount}</td>
                    <td className={`${shared.tableCell} ${styles.numberCell} ${shared.mutedText}`}>
                      {formatDateTime(problem.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  } catch (error) {
    return (
      <>
        {header('문제')}
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
