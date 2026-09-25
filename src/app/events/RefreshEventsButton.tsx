'use client'

import { useTransition } from 'react'
import { Button, useToast } from '@/shared'
import { refreshEvents } from './actions'

/**
 * 행사 판매처를 지금 다시 읽는 버튼. 수십 초 걸려서 도는 동안 버튼을 잠그고 글자로 알린다.
 * 실패는 토스트로 흘려보내지 않는다 — 판매처가 막혔다는 이유는 읽고 넘어가야 하는 말이다.
 */
export function RefreshEventsButton() {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      color="primary"
      variant="weak"
      size="small"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const outcome = await refreshEvents()
          openToast(outcome.ok ? outcome.message : `갱신하지 못했습니다: ${outcome.message}`)
        })
      }
    >
      {isPending ? '판매처에서 가져오는 중…' : '판매처에서 다시 가져오기'}
    </Button>
  )
}
