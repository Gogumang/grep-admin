'use client'

import { useTransition } from 'react'
import { Button, useToast } from '@/shared'
import { collectClubRecruitments } from './actions'

export function CollectClubsButton() {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      color="primary"
      variant="weak"
      size="small"
      loading={isPending}
      disabled={isPending}
      onClick={() => startTransition(async () => openToast((await collectClubRecruitments()).message))}
    >
      {isPending ? '가져오는 중…' : '지금 가져오기'}
    </Button>
  )
}
