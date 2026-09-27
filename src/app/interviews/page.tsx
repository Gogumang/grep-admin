import { Fragment } from 'react'
import { interviewReports } from '@/lib/interviewReports'
import { CAREER_LEVEL_LABELS, OUTCOME_LABELS, STAGE_TYPE_LABELS, type InterviewOutcome } from '@/lib/interviews'
import { requireAdmin } from '@/lib/session'
import { Badge, Button, type BadgeColor } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from './interviews.css'

export const dynamic = 'force-dynamic'

const OUTCOME_COLORS: Record<InterviewOutcome, BadgeColor> = {
  passed: 'green',
  failed: 'red',
  unknown: 'elephant',
}

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
 * 회사별 면접 후기 목록. 후기 원본은 어드민에서만 본다 — 사이트에는 나중에 가공한 결과만 따로 낸다.
 * 회사는 제목 아래 칩(?company=)으로 거른다. 칩은 전체 목록에서 만든다 — 거른 목록으로 만들면 다른 회사로 건너갈 칩이 사라진다.
 */
export default async function InterviewReportsPage({ searchParams }: { searchParams: Promise<{ company?: string }> }) {
  await requireAdmin()
  const company = (await searchParams).company?.trim() || null

  const header = (title: string) => (
    <div className={styles.titleRow}>
      <h1 className={`${console.pageTitle} ${styles.titleRowTitle}`}>{title}</h1>
      <span className={styles.pushRight}>
        <Button as="a" href="/interviews/new" color="primary" variant="weak" size="small">
          새 후기
        </Button>
      </span>
    </div>
  )

  try {
    const allReports = await interviewReports.list()
    const reports = company ? allReports.filter((report) => report.companyName === company) : allReports
    const reportCountByCompany = new Map<string, number>()
    allReports.forEach((report) =>
      reportCountByCompany.set(report.companyName, (reportCountByCompany.get(report.companyName) ?? 0) + 1),
    )
    const companies = [...reportCountByCompany.entries()].sort(([left], [right]) => left.localeCompare(right, 'ko'))

    return (
      <>
        {header(company ? `${company} 면접 후기 ${reports.length}건` : `면접 후기 ${allReports.length}건`)}
        {companies.length > 0 && (
          <nav className={styles.filterRow} aria-label="회사">
            <Button as="a" href="/interviews" color="dark" variant={company ? 'weak' : 'fill'} size="small">
              전체 {allReports.length}
            </Button>
            {companies.map(([name, count]) => (
              <Button
                key={name}
                as="a"
                href={`/interviews?company=${encodeURIComponent(name)}`}
                color="dark"
                variant={name === company ? 'fill' : 'weak'}
                size="small"
              >
                {name} {count}
              </Button>
            ))}
          </nav>
        )}
        {reports.length === 0 ? (
          <p className={shared.mutedText}>아직 후기가 없습니다. 새 후기를 넣어 주세요.</p>
        ) : (
          <div className={shared.card}>
            <table className={shared.table}>
              <thead>
                <tr>
                  <th className={shared.tableHead}>회사</th>
                  <th className={shared.tableHead}>직군</th>
                  <th className={shared.tableHead}>면접 달</th>
                  <th className={shared.tableHead}>전형</th>
                  <th className={shared.tableHead}>질문</th>
                  <th className={shared.tableHead}>결과</th>
                  <th className={shared.tableHead}>고친 때</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className={shared.tableCell}>
                      <a className={styles.reportLink} href={`/interviews/${encodeURIComponent(report.id)}`}>
                        {report.companyName}
                      </a>
                    </td>
                    <td className={shared.tableCell}>
                      {[report.jobCategory, report.careerLevel && CAREER_LEVEL_LABELS[report.careerLevel]]
                        .filter(Boolean)
                        .join(' · ') || <span className={shared.mutedText}>—</span>}
                    </td>
                    <td className={`${shared.tableCell} ${styles.numberCell}`}>
                      {report.interviewedIn ?? <span className={shared.mutedText}>—</span>}
                    </td>
                    <td className={shared.tableCell}>
                      <span className={styles.stageFlow}>
                        {report.stageTypes.map((stageType, index) => (
                          <Fragment key={index}>
                            {index > 0 && <span className={styles.stageArrow}>→</span>}
                            <Badge color="teal" variant="weak" size="xsmall">
                              {STAGE_TYPE_LABELS[stageType]}
                            </Badge>
                          </Fragment>
                        ))}
                      </span>
                    </td>
                    <td className={`${shared.tableCell} ${styles.numberCell}`}>{report.questionCount}</td>
                    <td className={shared.tableCell}>
                      <Badge color={OUTCOME_COLORS[report.outcome]} variant="weak" size="small">
                        {OUTCOME_LABELS[report.outcome]}
                      </Badge>
                    </td>
                    <td className={`${shared.tableCell} ${styles.numberCell} ${shared.mutedText}`}>
                      {formatDateTime(report.updatedAt)}
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
        {header('면접 후기')}
        <p className={shared.errorNotice}>{(error as Error).message}</p>
      </>
    )
  }
}
