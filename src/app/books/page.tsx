import { books, type BookPage, type BookSourceKey } from '@/lib/books'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as codingStyles from '../coding/coding.css'
import * as candidateStyles from '../coding/candidates/candidates.css'
import { BookFilters } from './BookFilters'
import { booksHref, type BookFilterValues } from './booksHref'
import * as styles from './books.css'

export const dynamic = 'force-dynamic'

const SOURCE_KEYS: BookSourceKey[] = ['aladin', 'yes24', 'amazon']

/** 주소의 조건을 믿지 않는다 — 모르는 값은 조건 없음으로 본다. collector 까지 보내면 404 가 화면을 덮는다. */
function parseFilters(params: { source?: string; keyword?: string; page?: string }) {
  const source = SOURCE_KEYS.find((key) => key === params.source) ?? null
  const pageNumber = Math.floor(Number(params.page))
  const page = pageNumber >= 1 ? pageNumber : 1
  const values: BookFilterValues = { source, keyword: params.keyword?.trim() ?? '' }
  return { values, page }
}

/** 출판사·출간일을 한 줄로. 둘 다 없으면(Amazon) 빈 줄이다. */
function describePublication(publisher: string | null, publishedLabel: string | null): string {
  return [publisher, publishedLabel].filter(Boolean).join(' · ')
}

/**
 * 다른 곳(알라딘·YES24·Amazon)에서 모은 컴퓨터 분야 책. 처음 본 것이 먼저다.
 * 표지는 수집할 때 한 번 받아 둔 우리 저장소의 그림이다 — 화면을 열 때마다 그곳에 다시 묻지 않는다.
 */
export default async function BooksPage({ searchParams }: { searchParams: Promise<{ source?: string; keyword?: string; page?: string }> }) {
  await requireAdmin()
  const { values, page } = parseFilters(await searchParams)

  let result: BookPage
  try {
    result = await books.list({ source: values.source ?? undefined, keyword: values.keyword || undefined, page })
  } catch (error) {
    return (
      <>
        <h1 className={console.pageTitle}>책 목록</h1>
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }

  const pageCount = Math.max(1, Math.ceil(result.totalCount / result.pageSize))

  return (
    <>
      <h1 className={console.pageTitle}>책 목록</h1>
      <BookFilters values={values} />

      {result.books.length === 0 ? (
        <p className={shared.mutedText}>
          {values.source || values.keyword ? '조건에 맞는 책이 없어요.' : '아직 모은 책이 없어요. 수집처에서 지금 가져오기를 눌러 주세요.'}
        </p>
      ) : (
        <div className={shared.card}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th className={`${shared.tableHead} ${styles.coverCell}`}>표지</th>
                <th className={shared.tableHead}>제목</th>
                <th className={shared.tableHead}>저자</th>
                <th className={shared.tableHead}>가격</th>
                <th className={shared.tableHead}>모은 날</th>
              </tr>
            </thead>
            <tbody>
              {result.books.map((book) => (
                <tr key={`${book.source}/${book.externalId}`}>
                  <td className={`${shared.tableCell} ${styles.coverCell}`}>
                    {book.coverUrl ? (
                      <img className={styles.cover} src={book.coverUrl} alt="" width={48} height={72} loading="lazy" />
                    ) : (
                      <span className={styles.cover} aria-hidden="true" />
                    )}
                  </td>
                  <td className={shared.tableCell}>
                    <a className={styles.bookTitle} href={book.url} target="_blank" rel="noreferrer">
                      {book.title}
                    </a>
                    <div className={shared.mutedText}>
                      {[book.sourceLabel, describePublication(book.publisher, book.publishedLabel)].filter(Boolean).join(' · ')}
                    </div>
                  </td>
                  <td className={shared.tableCell}>{book.authors ?? '—'}</td>
                  <td className={`${shared.tableCell} ${codingStyles.numberCell}`}>{book.priceLabel ?? '—'}</td>
                  <td className={`${shared.tableCell} ${codingStyles.numberCell}`}>
                    {new Date(book.firstSeenAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav className={candidateStyles.pager} aria-label="쪽">
          {page > 1 ? <a href={booksHref(values, page - 1)}>이전</a> : <span>이전</span>}
          <span>
            {page.toLocaleString()} / {pageCount.toLocaleString()}쪽 · {result.totalCount.toLocaleString()}권
          </span>
          {page < pageCount ? <a href={booksHref(values, page + 1)}>다음</a> : <span>다음</span>}
        </nav>
      )}
    </>
  )
}
