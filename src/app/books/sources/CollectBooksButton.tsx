'use client'

import { useTransition } from 'react'
import { Button, useToast } from '@/shared'
import { collectBooks } from './actions'

/** 켜 둔 수집처를 지금 읽는다. 다 읽을 때까지 버튼이 돈다(처음에는 표지를 받느라 몇 분) — 끝나면 몇 곳에서 몇 권을 쌓았는지 알린다. */
export function CollectBooksButton() {
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
          const outcome = await collectBooks()
          openToast(outcome.message)
        })
      }
    >
      지금 가져오기
    </Button>
  )
}
