'use client'

import { useTransition } from 'react'
import { Button, useToast } from '@/shared'
import { collectAllJobs, collectCompanyJobs } from './actions'

/**
 * 채용공고를 지금 다시 가져온다. companyKey 를 주면 그 회사만.
 * 결과는 토스트로 알린다 — 실패한 회사가 있으면 이유까지 함께 보인다.
 */
export function CollectJobsButton({ companyKey, label }: { companyKey?: string; label: string }) {
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      color={companyKey ? 'light' : 'primary'}
      variant={companyKey ? 'fill' : 'weak'}
      size="small"
      disabled={isPending}
      loading={isPending}
      onClick={() =>
        startTransition(async () => {
          const outcome = companyKey ? await collectCompanyJobs(companyKey) : await collectAllJobs()
          openToast(outcome.message)
        })
      }
    >
      {isPending ? '가져오는 중…' : label}
    </Button>
  )
}
