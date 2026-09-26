import { collector, type CodingCandidatePage, type CodingSourceKey } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import { Badge, Button } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as codingStyles from '../coding.css'
import { CandidateFilters } from './CandidateFilters'
import { candidatesHref, type CandidateFilterValues } from './candidatesHref'
import { ImportCandidateButton } from './ImportCandidateButton'
import * as styles from './candidates.css'

export const dynamic = 'force-dynamic'

const SOURCE_KEYS: CodingSourceKey[] = ['programmers', 'leetcode', 'codeforces', 'solved_ac']
const LEVEL_LABELS: Record<number, string> = { 1: '쉬움', 2: '보통', 3: '어려움' }

/** 태그는 앞의 몇 개만 — Codeforces 는 한 문제에 태그가 대여섯 개라 줄이 넘친다. */
const SHOWN_TAG_COUNT = 3

/** 주소의 조건을 믿지 않는다 — 모르는 값은 조건 없음으로 본다. collector 까지 보내면 400 이 화면을 덮는다. */
function parseFilters(params: { source?: string; level?: string; keyword?: string; page?: string }) {
  const source = SOURCE_KEYS.find((key) => key === params.source) ?? null
  const levelNumber = Number(params.level)
  const level = levelNumber >= 1 && levelNumber <= 3 ? levelNumber : null
  const pageNumber = Math.floor(Number(params.page))
  const page = pageNumber >= 1 ? pageNumber : 1
  const values: CandidateFilterValues = { source, level, keyword: params.keyword?.trim() ?? '' }
  return { values, page }
}

/**
 * 다른 곳(프로그래머스·LeetCode·Codeforces·solved.ac)에서 모은 문제 목록. 푼 사람이 많은 순이다.
 * '가져오기'를 누르면 그 문제 하나를 초안으로 만들어 편집 화면으로 간다 — 지문은 그때 받는다.
 */
export default async function CodingCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; level?: string; keyword?: string; page?: string }>
}) {
  await requireAdmin()
  const { values, page } = parseFilters(await searchParams)

  let result: CodingCandidatePage
  try {
    result = await collector.listCodingCandidates({
      source: values.source ?? undefined,
      level: values.level ?? undefined,
      keyword: values.keyword || undefined,
      page,
    })
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>문제 후보</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  const pageCount = Math.max(1, Math.ceil(result.totalCount / result.pageSize))

  return (
    <>
      <h1 className={console.pageTitle}>문제 후보</h1>
      <CandidateFilters values={values} />

      {result.candidates.length === 0 ? (
        <p className={shared.mutedText}>
          {values.source || values.level || values.keyword
            ? '조건에 맞는 문제가 없어요.'
            : '아직 모은 문제가 없어요. 수집처에서 지금 가져오기를 눌러 주세요.'}
        </p>
      ) : (
        <div className={shared.card}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th className={shared.tableHead}>제목</th>
                <th className={shared.tableHead}>난이도</th>
                <th className={shared.tableHead}>태그</th>
                <th className={shared.tableHead}>푼 사람</th>
                <th className={`${shared.tableHead} ${shared.actionCell}`} />
              </tr>
            </thead>
            <tbody>
              {result.candidates.map((candidate) => (
                <tr key={`${candidate.source}/${candidate.externalId}`}>
                  <td className={shared.tableCell}>
                    <a className={codingStyles.problemLink} href={candidate.url} target="_blank" rel="noreferrer">
                      {candidate.title}
                    </a>
                    <div className={shared.mutedText}>{candidate.sourceLabel}</div>
                  </td>
                  <td className={`${shared.tableCell} ${codingStyles.numberCell}`}>
                    {candidate.level ? LEVEL_LABELS[candidate.level] : '모름'}
                    {candidate.difficultyLabel && <span className={styles.difficultyLabel}>{candidate.difficultyLabel}</span>}
                  </td>
                  <td className={shared.tableCell}>
                    <span className={codingStyles.tagList}>
                      {candidate.tags.slice(0, SHOWN_TAG_COUNT).map((tag) => (
                        <Badge key={tag} color="teal" variant="weak" size="xsmall">
                          {tag}
                        </Badge>
                      ))}
                    </span>
                  </td>
                  <td className={`${shared.tableCell} ${codingStyles.numberCell}`}>
                    {candidate.solvedCount === null ? '—' : candidate.solvedCount.toLocaleString()}
                  </td>
                  <td className={`${shared.tableCell} ${shared.actionCell}`}>
                    {candidate.importedProblemId ? (
                      <Button as="a" href={`/coding/${encodeURIComponent(candidate.importedProblemId)}`} size="small" variant="weak">
                        초안 열기
                      </Button>
                    ) : (
                      <ImportCandidateButton source={candidate.source} externalId={candidate.externalId} title={candidate.title} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav className={styles.pager} aria-label="쪽">
          {page > 1 ? <a href={candidatesHref(values, page - 1)}>이전</a> : <span>이전</span>}
          <span>
            {page.toLocaleString()} / {pageCount.toLocaleString()}쪽 · {result.totalCount.toLocaleString()}문제
          </span>
          {page < pageCount ? <a href={candidatesHref(values, page + 1)}>다음</a> : <span>다음</span>}
        </nav>
      )}
    </>
  )
}
