'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, useToast } from '@/shared'
import type { CodingSourceKey } from '@/lib/collector'
import { importCodingCandidate } from './actions'

/** 후보 하나를 초안으로 가져와 그 편집 화면으로 간다. 실패하면(지문을 못 받음 등) 이유를 알리고 제자리에 둔다. */
export function ImportCandidateButton({ source, externalId, title }: { source: CodingSourceKey; externalId: string; title: string }) {
  const router = useRouter()
  const { openToast } = useToast()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      color="primary"
      variant="weak"
      size="small"
      loading={isPending}
      aria-label={`${title} 초안으로 가져오기`}
      onClick={() =>
        startTransition(async () => {
          const outcome = await importCodingCandidate(source, externalId)
          openToast(outcome.message)
          if (outcome.ok && outcome.problemId) router.push(`/coding/${encodeURIComponent(outcome.problemId)}`)
        })
      }
    >
      가져오기
    </Button>
  )
}
