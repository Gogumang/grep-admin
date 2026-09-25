'use client'

import { useRouter } from 'next/navigation'
import { Tab } from '@/shared'

export type ClubKind = 'club' | 'bootcamp'

/** 동아리·부트캠프 중 무엇을 볼지는 주소(?kind=)에 둔다 — 새로 고쳐도 보던 쪽이 그대로 열린다. */
export function ClubKindTabs({ kind, counts }: { kind: ClubKind; counts: Record<ClubKind, number> }) {
  const router = useRouter()
  const items: { key: ClubKind; label: string }[] = [
    { key: 'club', label: `동아리 ${counts.club}` },
    { key: 'bootcamp', label: `부트캠프 ${counts.bootcamp}` },
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
