'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { PostBody } from '@/components/preview/PostBody'
import * as bodyStyles from '@/components/preview/postBody.css'
import { Badge, Button, useToast } from '@/shared'
import type { ReviewedJobDetail } from '@/lib/collector'
import * as console from '@/styles/console.css'
import * as review from '../../review/ReviewWorkbench.css'
import { type ActionResult, publishJobs, rejectJobs, unpublishJobs } from '../actions'
import * as styles from '../jobReview.css'

const STATUS_LABELS = { pending: '검증 대기', published: '사이트에 공개됨', rejected: '치움' } as const

function fullDate(isoDate: string): string {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(isoDate),
  )
}

/**
 * 채용공고 하나를 보고 판단하는 자리.
 *
 * 본문은 사이트 공고 페이지와 같은 렌더러(PostBody)로 그린다 — "이대로 나가도 되나"를 보는 곳이라
 * 나갈 모습 그대로 보여야 한다. 글 검토와 달리 고치는 기능은 두지 않는다. 공고는 원문이 매일 다시
 * 들어와 덮이므로, 여기서 고친 문장은 다음 수집에 사라진다.
 */
export function JobReviewDetail({ detail }: { detail: ReviewedJobDetail }) {
  const router = useRouter()
  const { openToast } = useToast()
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { job, body } = detail
  const backHref = job.reviewStatus === 'published' ? '/jobs/published' : '/jobs'

  function run(action: (jobIds: string[]) => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action([job.id])
      if (!result.ok) {
        setFailure(result.message)
        return
      }
      setFailure(null)
      openToast(result.message)
      // 처리한 공고는 지금 목록에서 빠진다 — 빈 화면에 남기지 않고 목록으로 돌려보낸다.
      router.push(backHref)
      router.refresh()
    })
  }

  return (
    <>
      <a href={backHref} className={review.backLink}>
        ⬅️ {job.reviewStatus === 'published' ? '공개한 채용공고' : '채용 검증'}
      </a>
      <h1 className={console.pageTitle}>{job.title}</h1>

      <p className={styles.detailMeta}>
        <Badge color={job.reviewStatus === 'published' ? 'green' : 'elephant'} variant="weak" size="small">
          {STATUS_LABELS[job.reviewStatus]}
        </Badge>
        {job.closed && (
          <Badge color="red" variant="weak" size="small">
            원문에서 마감됨
          </Badge>
        )}
        {[job.companyName, job.jobCategory, job.careerLevel, job.employmentType, job.location].filter(Boolean).join(' · ')}
      </p>
      <p className={styles.detailMeta}>
        {job.openedAt && `게시 ${fullDate(job.openedAt)}`}
        {job.closesAt ? ` · 마감 ${fullDate(job.closesAt)}` : ' · 상시 채용'}
        {' · '}
        <a href={job.url} target="_blank" rel="noopener noreferrer">
          원문 공고 열기 ↗
        </a>
      </p>

      <div className={review.editorPanel}>
        <div className={review.tabBar}>
          <span className={review.editHint}>
            {job.closed ? '원문에서 마감된 공고는 공개할 수 없습니다' : '사이트 공고 페이지에 나갈 본문입니다'}
          </span>
          <span className={review.tabSpacer} />

          {job.reviewStatus === 'pending' && (
            <Button color="danger" variant="weak" size="small" disabled={isPending} onClick={() => run(rejectJobs)}>
              치우기
            </Button>
          )}
          {job.reviewStatus === 'published' ? (
            <Button color="danger" variant="weak" size="small" disabled={isPending} onClick={() => run(unpublishJobs)}>
              사이트에서 내리기
            </Button>
          ) : (
            // 치웠던 공고도 다시 올릴 수 있다 — 사람이 마음을 바꾼 것이다.
            <Button
              color="primary"
              size="small"
              disabled={isPending || job.closed}
              loading={isPending}
              onClick={() => run(publishJobs)}
            >
              이 공고 공개
            </Button>
          )}
        </div>

        <div className={review.editorBody}>
          <div className={bodyStyles.body}>
            {body ? (
              <PostBody body={body} />
            ) : (
              <p className={bodyStyles.missingBody}>
                본문을 가져오지 못한 공고입니다. 사이트에는 원문으로 가는 안내만 나갑니다.
              </p>
            )}
          </div>
        </div>

        {failure && <p className={review.errorNotice}>{failure}</p>}
      </div>
    </>
  )
}
