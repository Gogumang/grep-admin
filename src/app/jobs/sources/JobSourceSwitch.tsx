'use client'

import { useOptimistic, useTransition } from 'react'
import { Switch, useToast } from '@/shared'
import { setJobSourceEnabled } from './actions'

/**
 * 회사 하나의 매일 수집 스위치. 동아리 수집처 스위치처럼 서버 응답보다 먼저 움직인다 —
 * 가만히 있으면 안 눌린 줄 알고 한 번 더 누른다. 거절되면 다시 그린 값으로 돌아온다.
 */
export function JobSourceSwitch({ companyKey, name, enabled }: { companyKey: string; name: string; enabled: boolean }) {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [shown, setShown] = useOptimistic(enabled)

  return (
    <Switch
      checked={shown}
      disabled={isPending}
      aria-label={`${name} 수집`}
      title={shown ? '매일 08:00에 공고를 읽어요 — 끄면 다음 수집부터 빠져요' : '꺼둠 — 켜면 다음 수집부터 읽어요'}
      onChange={(_, checked) =>
        startTransition(async () => {
          setShown(checked)
          const outcome = await setJobSourceEnabled(companyKey, checked)
          openToast(outcome.message)
        })
      }
    />
  )
}
