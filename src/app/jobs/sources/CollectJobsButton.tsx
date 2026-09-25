'use client'

import { useTransition } from 'react'
import { Button, useToast } from '@/shared'
import { collectAllJobs } from './actions'

/**
 * 모든 회사의 채용공고를 지금 다시 가져온다.
 * 결과는 토스트로 알린다 — 실패한 회사가 있으면 이름까지 함께 보인다.
 */
export function CollectJobsButton({ label }: { label: string }) {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      color="primary"
      variant="weak"
      size="small"
      disabled={isPending}
      loading={isPending}
      onClick={() =>
        startTransition(async () => {
          const outcome = await collectAllJobs()
          openToast(outcome.message)
        })
      }
    >
      {isPending ? '가져오는 중…' : label}
    </Button>
  )
}
