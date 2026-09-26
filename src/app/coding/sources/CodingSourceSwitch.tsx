'use client'

import { useOptimistic, useTransition } from 'react'
import { Switch, useToast } from '@/shared'
import type { CodingSourceKey } from '@/lib/collector'
import { setCodingSourceEnabled } from './actions'

/** 수집처 하나의 수집 스위치. 행사 수집처 스위치처럼 서버 응답보다 먼저 움직이고, 거절되면 다시 그린 값으로 돌아온다. */
export function CodingSourceSwitch({ sourceKey, name, enabled }: { sourceKey: CodingSourceKey; name: string; enabled: boolean }) {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [shown, setShown] = useOptimistic(enabled)

  return (
    <Switch
      checked={shown}
      disabled={isPending}
      aria-label={`${name} 수집`}
      title={shown ? '수집할 때 이곳 문제 목록을 읽어요 — 끄면 다음 수집부터 빠져요' : '꺼둠 — 켜면 다음 수집부터 읽어요'}
      onChange={(_, checked) =>
        startTransition(async () => {
          setShown(checked)
          const outcome = await setCodingSourceEnabled(sourceKey, checked)
          openToast(outcome.message)
        })
      }
    />
  )
}
