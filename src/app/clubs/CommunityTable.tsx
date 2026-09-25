import { Badge, type BadgeColor } from '@/shared'
import * as shared from '@/components/shared.css'
import { ClubIcon } from './ClubIcon'
import * as styles from './clubs.css'

export type CommunityPlatform = 'web' | 'discord' | 'kakao' | 'slack' | 'facebook' | 'meetup' | 'youtube'

export interface Community {
  key: string
  name: string
  platform: CommunityPlatform
  /** 무엇을 이야기하는 곳인지 한 줄. */
  topic: string
  /** 들어가거나 읽는 곳. 링크를 공개하지 않는 모임은 null. */
  url: string | null
}

const ICON_SIZE = 24

const PLATFORMS: Record<CommunityPlatform, { label: string; color: BadgeColor }> = {
  web: { label: '웹', color: 'blue' },
  discord: { label: '디스코드', color: 'teal' },
  kakao: { label: '카카오 오픈채팅', color: 'yellow' },
  slack: { label: '슬랙', color: 'green' },
  facebook: { label: '페이스북 그룹', color: 'elephant' },
  meetup: { label: '밋업', color: 'green' },
  youtube: { label: '유튜브', color: 'red' },
}

/** 개발자 커뮤니티. 모집 일정이 없는 곳이라 자동 수집 칸 없이 어디서 무엇을 이야기하는지만 보인다. */
export function CommunityTable({ communities }: { communities: Community[] }) {
  return (
    <div className={shared.card}>
      <table className={shared.table}>
        <thead>
          <tr>
            <th className={shared.tableHead}>이름</th>
            <th className={shared.tableHead}>형태</th>
            <th className={shared.tableHead}>주제</th>
            <th className={shared.tableHead}>주소</th>
          </tr>
        </thead>
        <tbody>
          {communities.map((community) => {
            const platform = PLATFORMS[community.platform]
            return (
              <tr key={community.key}>
                <td className={shared.tableCell}>
                  <span className={styles.nameCell}>
                    <ClubIcon clubKey={community.key} name={community.name} size={ICON_SIZE} />
                    <span className={styles.clubName}>{community.name}</span>
                  </span>
                </td>
                <td className={shared.tableCell}>
                  <Badge color={platform.color} variant="weak" size="xsmall">
                    {platform.label}
                  </Badge>
                </td>
                <td className={shared.tableCell}>{community.topic}</td>
                <td className={shared.tableCell}>
                  {community.url ? (
                    <a href={community.url} target="_blank" rel="noreferrer" className={shared.truncatedUrl}>
                      {community.url.replace(/^https:\/\/(www\.)?/, '')}
                    </a>
                  ) : (
                    <span className={shared.mutedText}>비공개</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
