'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { Badge, Button, Checkbox, FilterSelect, ListRow, useToast } from '@/shared'
import type { ReviewedJob } from '@/lib/collector'
import * as review from '../review/ReviewWorkbench.css'
import { type ActionResult, publishJobs, rejectJobs, unpublishJobs } from './actions'
import * as styles from './jobReview.css'

/** 게시일·마감일을 목록에 짧게 적는다. 연도까지는 필요 없다 — 열린 공고는 대부분 올해 것이다. */
function shortDate(isoDate: string): string {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric' }).format(
    new Date(isoDate),
  )
}

/**
 * 채용공고 검증 목록. 대기(pending)와 공개(published) 두 화면이 함께 쓴다.
 *
 * 글 검토 목록과 달리 여기서 바로 여러 건을 골라 처리한다 — 공고는 회사당 수십 건씩 들어오고
 * 제목만으로 판단되는 경우가 많다(영업 직군이 섞인 것 등). 본문을 봐야 할 공고만 "보기"로 연다.
 */
export function JobReviewList({ jobs, mode }: { jobs: ReviewedJob[]; mode: 'pending' | 'published' }) {
  const router = useRouter()
  const { openToast } = useToast()
  const [company, setCompany] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  /** 실패만 남긴다. 성공은 토스트로 흘려보내도 되지만, 실패는 고칠 때까지 보여야 한다. */
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const companies = useMemo(() => {
    const counts = new Map<string, number>()
    for (const job of jobs) counts.set(job.companyName, (counts.get(job.companyName) ?? 0) + 1)
    return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'ko'))
  }, [jobs])

  const visibleJobs = company ? jobs.filter((job) => job.companyName === company) : jobs
  // 회사를 바꿔도 고른 것은 남긴다. 다만 처리 대상은 지금 보이는 공고로만 한다 — 안 보이는 것을 함께 올리면 놀란다.
  const selectedVisibleIds = visibleJobs.filter((job) => selected.has(job.id)).map((job) => job.id)
  const isAllVisibleSelected = visibleJobs.length > 0 && selectedVisibleIds.length === visibleJobs.length

  function toggle(jobId: string, checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous)
      if (checked) next.add(jobId)
      else next.delete(jobId)
      return next
    })
  }

  function toggleAllVisible(checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous)
      for (const job of visibleJobs) {
        if (checked) next.add(job.id)
        else next.delete(job.id)
      }
      return next
    })
  }

  function run(action: (jobIds: string[]) => Promise<ActionResult>) {
    const jobIds = selectedVisibleIds
    startTransition(async () => {
      const result = await action(jobIds)
      if (!result.ok) {
        setFailure(result.message)
        return
      }
      setFailure(null)
      setSelected((previous) => new Set([...previous].filter((jobId) => !jobIds.includes(jobId))))
      openToast(result.message)
      router.refresh()
    })
  }

  if (jobs.length === 0) {
    return (
      <div className={review.panel}>
        <p className={review.emptyState}>
          {mode === 'pending'
            ? '검증할 공고가 없습니다. 매일 아침 수집이 돌면 여기에 쌓입니다.'
            : '사이트에 올린 공고가 없습니다. 채용 검증에서 공고를 공개하면 여기에 나옵니다.'}
        </p>
      </div>
    )
  }

  return (
    <div className={review.listPanel}>
      {/* 회사가 열 곳을 넘어 버튼으로 늘어놓으면 두세 줄로 접힌다. 칩 하나를 눌러 고르게 둔다. */}
      <div className={styles.filterBar}>
        <FilterSelect
          label="회사"
          description={`전체 ${jobs.length}건 · 공고 많은 순`}
          options={companies.map(([name, count]) => ({ value: name, label: name, count }))}
          value={company}
          onChange={setCompany}
        />
      </div>

      <div className={styles.actionBar}>
        <label className={styles.selectAll}>
          <Checkbox.Line
            size={20}
            checked={isAllVisibleSelected}
            onCheckedChange={toggleAllVisible}
            aria-label="보이는 공고 모두 고르기"
          />
          {selectedVisibleIds.length > 0 ? `${selectedVisibleIds.length}건 고름` : '모두 고르기'}
        </label>

        <span className={review.tabSpacer} />

        {mode === 'pending' ? (
          <>
            <Button
              color="danger"
              variant="weak"
              size="small"
              disabled={selectedVisibleIds.length === 0 || isPending}
              onClick={() => run(rejectJobs)}
            >
              치우기
            </Button>
            <Button
              color="primary"
              size="small"
              disabled={selectedVisibleIds.length === 0 || isPending}
              loading={isPending}
              onClick={() => run(publishJobs)}
            >
              고른 공고 공개
            </Button>
          </>
        ) : (
          <Button
            color="danger"
            variant="weak"
            size="small"
            disabled={selectedVisibleIds.length === 0 || isPending}
            loading={isPending}
            onClick={() => run(unpublishJobs)}
          >
            사이트에서 내리기
          </Button>
        )}
      </div>

      {failure && <p className={review.errorNotice}>{failure}</p>}

      <div className={review.pendingList}>
        {visibleJobs.map((job) => (
          <ListRow
            key={job.id}
            verticalPadding="small"
            horizontalPadding="small"
            border="none"
            left={
              <Checkbox.Line
                size={20}
                checked={selected.has(job.id)}
                onCheckedChange={(checked) => toggle(job.id, checked)}
                aria-label={`${job.title} 고르기`}
              />
            }
            contents={
              <ListRow.Texts
                title={job.title}
                description={
                  <>
                    {[job.companyName, job.jobCategory, job.careerLevel, job.openedAt && `게시 ${shortDate(job.openedAt)}`]
                      .filter(Boolean)
                      .join(' · ')}
                    {/* 마감일이 없으면 비워 두지 않고 적는다 — 빈칸은 "못 읽었다"와 "상시 채용"을 가르지 못한다. */}
                    {job.closesAt ? (
                      <Badge color="blue" variant="weak" size="xsmall">
                        {shortDate(job.closesAt)} 마감
                      </Badge>
                    ) : (
                      <Badge color="elephant" variant="weak" size="xsmall">
                        상시 채용
                      </Badge>
                    )}
                    {!job.hasBody && (
                      <Badge color="yellow" variant="weak" size="xsmall">
                        본문 없음
                      </Badge>
                    )}
                  </>
                }
              />
            }
            right={
              <Button as="a" href={`/jobs/${job.id}`} color="light" size="small">
                보기
              </Button>
            }
          />
        ))}
      </div>
    </div>
  )
}
