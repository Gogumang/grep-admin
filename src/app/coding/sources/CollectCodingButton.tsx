'use client'

import { useTransition } from 'react'
import { Button, useToast } from '@/shared'
import { collectCodingProblems } from './actions'

/** 켜 둔 수집처를 지금 읽는다. 다 읽을 때까지(1분 남짓) 버튼이 돈다 — 끝나면 몇 곳에서 몇 문제를 쌓았는지 알린다. */
export function CollectCodingButton() {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      color="primary"
      variant="weak"
      size="small"
      loading={isPending}
      onClick={() =>
        startTransition(async () => {
          const outcome = await collectCodingProblems()
          openToast(outcome.message)
        })
      }
    >
      지금 가져오기
    </Button>
  )
}
