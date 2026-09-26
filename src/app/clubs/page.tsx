import clubData from '@/data/clubs.json'
import communityData from '@/data/communities.json'
import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import { ClubIcon } from './ClubIcon'
import { ClubKindTabs, type ClubKind, type SourceTab } from './ClubKindTabs'
import { CommunityTable, type Community } from './CommunityTable'
import { CollectClubsButton } from './CollectClubsButton'
import { ClubCollectSwitch } from './ClubCollectSwitch'
import * as styles from './clubs.css'

export const dynamic = 'force-dynamic'

type CollectMethod = 'auto' | 'draft' | 'manual'

interface Club {
  key: string
  name: string
  /** 공식 사이트. 인스타그램에만 공지하는 동아리는 null. */
  siteUrl: string | null
  recruitUrl: string
  method: CollectMethod
  /** 생략하면 동아리. */
  kind?: ClubKind
}

const ICON_SIZE = 24

/** 앞의 것일수록 사람 손이 덜 간다 — 표도 이 순서로 줄을 세운다. */
const METHOD_ORDER: CollectMethod[] = ['auto', 'draft', 'manual']

const DESCRIPTION: Record<SourceTab, string> = {
  club: 'IT 연합 동아리의 모집 페이지예요. 자동으로 읽을 수 있는 곳은 매일 08:45에 모집 일정을 가져와요.',
  bootcamp:
    '개발 부트캠프의 모집 페이지예요. 우아한테크코스·카카오테크 부트캠프는 자동으로 읽어요. SSAFY 는 날짜에 연도가 없어 사람이 확정하고, 부스트캠프(2026년 쉼)·소프트웨어 마에스트로(로봇 접근 차단)·42서울(상시 모집)은 사람이 봐요.',
  community: '개발자가 모여 이야기하는 곳이에요. 모집 일정이 없어 자동으로 가져오지 않고, 어디에 있는지만 모아 둬요.',
}

const TITLE: Record<SourceTab, string> = { club: '동아리', bootcamp: '부트캠프', community: '커뮤니티' }

/**
 * 개발 동아리·부트캠프 수집처. 어디서 모집 정보를 가져올 수 있는지 본다.
 * 목록은 src/data/clubs.json 에 있다(동아리 2026-09-25, 부트캠프 2026-09-26 조사). 자동으로 읽을 수 있는 곳은 collector 가
 * 매일 08:45 에 모집 일정을 읽어 쌓는다 — 여기서는 곳마다 자동 수집을 켜고 끈다. 날짜를 읽을 수 없는 곳은 같은 시각에 모집 페이지가
 * 바뀌었는지만 본다. 수집·확인이 실패한 곳만 표 위에 알린다.
 * 동아리·부트캠프·커뮤니티는 제목 아래 탭(?kind=)으로 나눠 본다.
 * 커뮤니티 목록은 src/data/communities.json 에 있다 — 모집 일정이 없어 수집 대상이 아니다.
 */
export default async function ClubsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  await requireAdmin()
  const requested = (await searchParams).kind
  const kind: SourceTab = requested === 'bootcamp' || requested === 'community' ? requested : 'club'
  const communities = communityData.communities as Community[]
  const everyone = clubData.clubs as Club[]
  const kindOf = (club: Club): ClubKind => club.kind ?? 'club'
  const counts: Record<SourceTab, number> = {
    club: everyone.filter((club) => kindOf(club) === 'club').length,
    bootcamp: everyone.filter((club) => kindOf(club) === 'bootcamp').length,
    community: communities.length,
  }
  const rows = everyone
    .filter((club) => kindOf(club) === kind)
    .sort((left, right) => METHOD_ORDER.indexOf(left.method) - METHOD_ORDER.indexOf(right.method))
  // 스위치 값은 보조다 — collector 가 잠깐 안 되면 스위치 칸만 비운다. 커뮤니티 탭에는 스위치가 없어 부르지 않는다.
  const sources = kind === 'community' ? [] : await collector.listClubSources().catch(() => null)
  const enabledByClub = new Map((sources ?? []).map((source) => [source.clubKey, source.enabled]))
  // 마지막 확인 결과도 보조다 — 못 불러오면 실패 알림만 빠진다.
  const statuses = kind === 'community' ? [] : await collector.listClubRecruitments().catch(() => null)
  const statusByClub = new Map((statuses ?? []).map((status) => [status.clubKey, status]))
  // 켜 둔 자동 수집과 모집 페이지 확인의 마지막 실패를 위에 모아 알린다.
  const failures = rows.flatMap((club) => {
    const status = statusByClub.get(club.key)
    const check = status?.check ?? status?.pageCheck
    const isEnabled = enabledByClub.get(club.key) ?? true
    return check && !check.isOk && isEnabled ? [`${club.name}: ${check.message ?? '읽지 못했어요'}`] : []
  })

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={console.pageTitle}>
          {TITLE[kind]} 수집처 · {counts[kind]}곳
        </h1>
        {kind !== 'community' && <CollectClubsButton />}
      </div>
      <div className={styles.kindTabs}>
        <ClubKindTabs kind={kind} />
      </div>
      <p className={shared.mutedText} style={{ marginBottom: 16 }}>
        {DESCRIPTION[kind]}
      </p>
      {sources === null && <p className={shared.errorNotice}>collector 에서 자동 수집 설정을 불러오지 못했어요.</p>}
      {statuses === null && <p className={shared.errorNotice}>collector 에서 마지막 확인 결과를 불러오지 못했어요.</p>}
      {failures.map((failure) => (
        <p key={failure} className={shared.errorNotice}>
          {failure}
        </p>
      ))}

      {kind === 'community' ? (
        <CommunityTable communities={communities} />
      ) : (
        <div className={shared.card}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th className={shared.tableHead}>이름</th>
                <th className={shared.tableHead}>모집 페이지</th>
                <th className={shared.tableHead}>자동 수집</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((club) => (
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
                  <td className={shared.tableCell}>
                    <a href={club.recruitUrl} target="_blank" rel="noreferrer" className={shared.truncatedUrl}>
                      {club.recruitUrl.replace(/^https:\/\/(www\.)?/, '')}
                    </a>
                  </td>
                  <td className={shared.tableCell}>
                    {enabledByClub.has(club.key) ? (
                      <ClubCollectSwitch clubKey={club.key} name={club.name} enabled={enabledByClub.get(club.key) ?? true} />
                    ) : (
                      <span className={shared.mutedText}>{club.method === 'auto' ? '—' : '불가'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
