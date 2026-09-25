'use client'

import { useRouter } from 'next/navigation'
import { Tab } from '@/shared'

export type ClubKind = 'club' | 'bootcamp'

/** 탭은 모집 수집처 두 종류에 커뮤니티를 더한 셋이다. */
export type SourceTab = ClubKind | 'community'

/** 동아리·부트캠프·커뮤니티 중 무엇을 볼지는 주소(?kind=)에 둔다 — 새로 고쳐도 보던 쪽이 그대로 열린다. */
export function ClubKindTabs({ kind, counts }: { kind: SourceTab; counts: Record<SourceTab, number> }) {
  const router = useRouter()
  const items: { key: SourceTab; label: string }[] = [
    { key: 'club', label: `동아리 ${counts.club}` },
    { key: 'bootcamp', label: `부트캠프 ${counts.bootcamp}` },
    { key: 'community', label: `커뮤니티 ${counts.community}` },
  ]

  return (
    <Tab size="small" ariaLabel="수집처 종류" onChange={(_, key) => router.replace(`/clubs?kind=${String(key)}`)}>
      {items.map((item) => (
        <Tab.Item key={item.key} itemKey={item.key} selected={item.key === kind}>
          {item.label}
        </Tab.Item>
      ))}
    </Tab>
  )
}
