'use client'

import { useOptimistic, useTransition } from 'react'
import { Switch, useToast } from '@/shared'
import { setClubEnabled } from './actions'

/**
 * 동아리 하나의 자동 수집 스위치. 블로그 수집처 스위치처럼 서버 응답보다 먼저 움직인다 —
 * 가만히 있으면 안 눌린 줄 알고 한 번 더 누른다. 거절되면 다시 그린 값으로 돌아온다.
 */
export function ClubCollectSwitch({ clubKey, name, enabled }: { clubKey: string; name: string; enabled: boolean }) {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [shown, setShown] = useOptimistic(enabled)

  return (
    <Switch
      checked={shown}
      disabled={isPending}
      aria-label={`${name} 자동 수집`}
      title={shown ? '매일 08:45에 모집 일정을 읽어요 — 끄면 다음 수집부터 빠져요' : '꺼둠 — 켜면 다음 수집부터 읽어요'}
      onChange={(_, checked) =>
        startTransition(async () => {
          setShown(checked)
          const outcome = await setClubEnabled(clubKey, checked)
          if (!outcome.ok) openToast(outcome.message)
        })
      }
    />
  )
}
