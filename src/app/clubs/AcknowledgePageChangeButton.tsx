'use client'

import { useTransition } from 'react'
import { Button, useToast } from '@/shared'
import { acknowledgeClubPageChange } from './actions'

/** 바뀐 모집 페이지를 열어 일정을 맞춘 뒤 누른다. 다음에 페이지가 또 바뀌면 배지가 다시 뜬다. */
export function AcknowledgePageChangeButton({ clubKey }: { clubKey: string }) {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      color="dark"
      variant="weak"
      size="small"
      loading={isPending}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const outcome = await acknowledgeClubPageChange(clubKey)
          if (!outcome.ok) openToast(outcome.message)
        })
      }
    >
      확인했어요
    </Button>
  )
}
