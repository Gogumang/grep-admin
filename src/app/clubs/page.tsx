import clubData from '@/data/clubs.json'
import { collector, type ClubRecruitments } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import { Badge } from '@/shared'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { ClubIcon } from './ClubIcon'
import { CollectClubsButton } from './CollectClubsButton'
import { RecruitmentStatus } from './RecruitmentStatus'
import * as styles from './clubs.css'

export const dynamic = 'force-dynamic'

type CollectMethod = 'auto' | 'draft' | 'manual'

interface Club {
  key: string
  name: string
  /** 공식 사이트. 인스타그램에만 공지하는 동아리는 null. */
  siteUrl: string | null
  recruitUrl: string
  cadence: string
  /** 2026-09-25 사이트에서 확인한 가장 최근 모집. 없으면 날짜를 공개하지 않은 것이다. */
  latestRecruitment: string | null
  method: CollectMethod
  howToRead: string
  note: string | null
}

const ICON_SIZE = 24

/** 수집 방법별로 묶는다. 앞의 것일수록 사람 손이 덜 간다. */
const SECTIONS: { method: CollectMethod; title: string; description: string }[] = [
  { method: 'auto', title: '자동으로 읽을 수 있음', description: '모집 일정(기수·시작·마감)을 사이트에서 기계적으로 읽을 수 있어요.' },
  {
    method: 'draft',
    title: '초안을 만들고 사람이 확정',
    description: '날짜는 보이지만 연도나 기수가 빠져 있어 그대로 믿을 수 없어요.',
  },
  {
    method: 'manual',
    title: '사람이 입력',
    description: '날짜를 공개하지 않거나, 학교별로 모집하거나, 인스타그램에만 공지해요.',
  },
]

/**
 * 개발 동아리 수집처. 어디서 모집 정보를 가져올 수 있는지와 모집 주기를 본다.
 * 목록은 src/data/clubs.json 에 있다(2026-09-25 조사). 자동으로 읽을 수 있는 네 곳은 collector 가 매일 08:45 에
 * 모집 일정을 읽어 쌓는다 — 그 네 곳은 '최근 모집'에 가져온 일정과 상태를 보여 준다.
 */
export default async function ClubsPage() {
  await requireAdmin()
  const clubs = clubData.clubs as Club[]
  // 가져온 일정은 보조다 — collector 가 잠깐 안 되면 조사 때 적어 둔 값으로 보여 준다.
  const collected = await collector.listClubRecruitments().catch(() => null)
  const collectedByClub = new Map((collected ?? []).map((entry: ClubRecruitments) => [entry.clubKey, entry]))
  const now = new Date()

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={console.pageTitle}>동아리 수집처 · {clubs.length}곳</h1>
        <CollectClubsButton />
      </div>
      <p className={shared.mutedText}>
        IT 연합 동아리의 모집 페이지와 모집 주기예요. 자동으로 읽을 수 있는 네 곳은 매일 08:45에 모집 일정을 가져오고, 나머지의
        &lsquo;최근 모집&rsquo;은 2026-09-25에 사이트에서 확인한 값이에요.
      </p>
      {collected === null && <p className={shared.errorNotice}>collector 에서 가져온 모집 일정을 불러오지 못해 조사 때 값으로 보여 줘요.</p>}

      {SECTIONS.map((section) => {
        const inSection = clubs.filter((club) => club.method === section.method)
        return (
          <section key={section.method} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {section.title} {inSection.length}
            </h2>
            <p className={shared.mutedText} style={{ marginBottom: 8 }}>
              {section.description}
            </p>
            <div className={shared.card}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th className={shared.tableHead}>동아리</th>
                    <th className={shared.tableHead}>모집 주기</th>
                    <th className={shared.tableHead}>최근 모집</th>
                    <th className={shared.tableHead}>읽는 방법</th>
                    <th className={shared.tableHead}>모집 페이지</th>
                  </tr>
                </thead>
                <tbody>
                  {inSection.map((club) => (
                    <tr key={club.key}>
                      <td className={shared.tableCell}>
                        <span className={styles.nameCell}>
                          <ClubIcon clubKey={club.key} name={club.name} size={ICON_SIZE} />
                          {club.siteUrl ? (
                            <a className={styles.clubName} href={club.siteUrl} target="_blank" rel="noreferrer">
                              {club.name}
                            </a>
                          ) : (
                            <span className={styles.clubName}>{club.name}</span>
                          )}
                        </span>
                      </td>
                      <td className={shared.tableCell}>{club.cadence}</td>
                      <td className={shared.tableCell}>
                        {club.method === 'auto' && collected !== null ? (
                          <RecruitmentStatus collected={collectedByClub.get(club.key)} now={now} />
                        ) : club.latestRecruitment ? (
                          club.latestRecruitment
                        ) : (
                          <Badge color="elephant" variant="weak" size="xsmall">
                            날짜 비공개
                          </Badge>
                        )}
                      </td>
                      <td className={shared.tableCell}>
                        {club.howToRead}
                        {club.note && <span className={styles.note}>{club.note}</span>}
                      </td>
                      <td className={shared.tableCell}>
                        <a href={club.recruitUrl} target="_blank" rel="noreferrer" className={shared.truncatedUrl}>
                          {club.recruitUrl.replace(/^https:\/\/(www\.)?/, '')}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </>
  )
}
