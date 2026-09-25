'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Loader, Stepper, StepperRow, useToast } from '@/shared'
import * as collectStyles from '../../collect/CollectRunner.css'
import * as shared from '@/components/shared.css'
import { type CompanyCollectOutcome, collectCompanyJobs, refreshJobScreens } from './actions'

export interface JobCompany {
  companyKey: string
  companyName: string
}

/** 회사가 열 곳 남짓이라 TDS 기본 간격(0.1초)이면 목록이 늦게 뜬다. 블로그 수집 화면과 같게 줄인다. */
const ROW_STAGGER_SECONDS = 0.03

type RowState = 'waiting' | 'running' | 'done' | 'failed'

function StatusMark({ state }: { state: RowState }) {
  if (state === 'running') return <Loader size="small" label="진행 중" />
  if (state === 'done') return <span className={collectStyles.markDone}>✓</span>
  if (state === 'failed') return <span className={collectStyles.markFailed}>✕</span>
  return null
}

/** 줄 왼쪽 원. 번호 원은 9까지만 되고 회사 아이콘은 없어 이름 첫 글자를 둔다. */
function CompanyInitial({ name }: { name: string }) {
  return <span className={collectStyles.saveIcon}>{name.slice(0, 1)}</span>
}

/**
 * 채용 전체 가져오기. 블로그 수집 실행처럼 회사를 하나씩 차례로 돌며 Stepper 로 어디를 돌고 있는지,
 * 어디서 새 공고가 나왔고 어디가 실패했는지 보여 준다. 한 번에 다 부르면 몇 분 동안 아무것도 보이지 않고
 * 요청 하나가 제한 시간에 걸린다 — 회사마다 따로 부르면 둘 다 없다.
 */
export function JobCollectRunner({ companies }: { companies: JobCompany[] }) {
  const router = useRouter()
  const { openToast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [results, setResults] = useState<CompanyCollectOutcome[]>([])

  async function run() {
    setIsRunning(true)
    setHasStarted(true)
    setResults([])

    // 차례로 돈다 — 동시에 던지면 어느 회사를 도는지 보이지 않고 collector 가 채용 사이트들을 한꺼번에 두드린다.
    const collected: CompanyCollectOutcome[] = []
    for (const company of companies) {
      const outcome = await collectCompanyJobs(company.companyKey)
      collected.push(outcome)
      setResults([...collected])
    }

    await refreshJobScreens()
    setIsRunning(false)
    const added = collected.reduce((sum, outcome) => sum + outcome.addedCount, 0)
    const failed = collected.filter((outcome) => !outcome.ok).length
    openToast(`새 공고 ${added}건${failed > 0 ? `, 실패 ${failed}곳` : ''}. 새 공고는 채용 검증에 있습니다.`)
    router.refresh()
  }

  const resultByCompany = new Map(results.map((result) => [result.companyKey, result]))
  const runningKey = isRunning ? companies[results.length]?.companyKey : undefined
  const progress = companies.length === 0 ? 0 : Math.round((results.length / companies.length) * 100)
  const addedCount = results.reduce((sum, result) => sum + result.addedCount, 0)
  const failedCount = results.filter((result) => !result.ok).length

  return (
    <>
      <div className={shared.formRow}>
        <Button color="primary" variant="weak" size="small" onClick={run} disabled={isRunning || companies.length === 0}>
          {isRunning ? '가져오는 중…' : '전체 지금 가져오기'}
        </Button>
      </div>

      {hasStarted && (
        <>
          <div className={collectStyles.progressBar}>
            <div className={collectStyles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={shared.mutedText} style={{ marginBottom: 12 }}>
            {results.length}/{companies.length} · 새 공고 {addedCount}건 · 실패 {failedCount}곳
          </p>
          <div className={`${shared.card} ${collectStyles.stepperCard}`} style={{ marginBottom: 20 }}>
            <Stepper staggerDelay={ROW_STAGGER_SECONDS}>
              {companies.map((company, index) => {
                const result = resultByCompany.get(company.companyKey)
                const isCompanyRunning = company.companyKey === runningKey
                const state: RowState = isCompanyRunning ? 'running' : !result ? 'waiting' : result.ok ? 'done' : 'failed'
                const description = isCompanyRunning ? '가져오는 중…' : (result?.message ?? '대기')
                return (
                  <StepperRow
                    key={company.companyKey}
                    left={<StepperRow.AssetFrame content={<CompanyInitial name={company.companyName} />} />}
                    center={<StepperRow.Texts type="C" title={company.companyName} description={description} />}
                    right={<StatusMark state={state} />}
                    hideLine={index === companies.length - 1}
                  />
                )
              })}
            </Stepper>
          </div>
        </>
      )}
    </>
  )
}
