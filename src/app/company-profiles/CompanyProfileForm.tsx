'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CompanyCategory, ProfiledCompany, ProfiledCompanyInput } from '@/lib/companyProfiles'
import { Button, FilterSelect, useDialog, useToast } from '@/shared'
import * as shared from '@/components/shared.css'
import {
  addCompanyProfile,
  collectCompanyProfile,
  removeCompanyProfile,
  updateCompanyProfile,
  type CompanyProfileActionResult,
} from './actions'
import * as styles from './companyProfiles.css'

function toInput(company: ProfiledCompany): ProfiledCompanyInput {
  return {
    id: company.id,
    name: company.name,
    category: company.category,
    dartCorpCode: company.dartCorpCode ?? '',
    businessNumberPrefix: company.businessNumberPrefix ?? '',
    pensionSearchName: company.pensionSearchName ?? '',
  }
}

const EMPTY_INPUT: ProfiledCompanyInput = {
  id: '',
  name: '',
  category: '',
  dartCorpCode: '',
  businessNumberPrefix: '',
  pensionSearchName: '',
}

/**
 * 회사를 더하거나(company 없음) 연결을 고친다(company 있음).
 *
 * 형식 검사는 collector 가 한다 — 여기서 같은 규칙을 한 번 더 적으면 두 곳이 어긋난다.
 * 실패는 폼 아래에 남긴다. 토스트로 흘려보내면 "사업자번호를 적어 주세요" 같은 안내를 읽기 전에 사라진다.
 */
export function CompanyProfileForm({
  categories,
  company,
}: {
  categories: CompanyCategory[]
  company?: ProfiledCompany
}) {
  const router = useRouter()
  const { openToast } = useToast()
  const { openConfirm } = useDialog()
  const [input, setInput] = useState<ProfiledCompanyInput>(() => (company ? toInput(company) : EMPTY_INPUT))
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = company !== undefined

  const patch = (changes: Partial<ProfiledCompanyInput>) => setInput((current) => ({ ...current, ...changes }))

  const run = (action: () => Promise<CompanyProfileActionResult>, onSuccess?: () => void) =>
    startTransition(async () => {
      const result = await action()
      if (result.ok) {
        setFailure(null)
        openToast(result.message)
        onSuccess?.()
        router.refresh()
      } else {
        setFailure(result.message)
      }
    })

  const save = () =>
    run(
      () => (isEditing ? updateCompanyProfile(input) : addCompanyProfile(input)),
      () => {
        if (!isEditing) setInput(EMPTY_INPUT)
      },
    )

  const collect = () => run(() => collectCompanyProfile(input.id))

  const remove = async () => {
    const confirmed = await openConfirm({
      title: `${company?.name}을(를) 목록에서 뺄까요?`,
      description: '모아 둔 월별 인원과 손익도 함께 지워지고 되돌릴 수 없습니다.',
      confirmButton: '빼기',
    })
    if (!confirmed) return
    run(() => removeCompanyProfile(input.id), () => router.push('/company-profiles/companies'))
  }

  return (
    <div className={shared.card}>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>id (영문 소문자·숫자·-)</span>
          <input
            className={shared.input}
            placeholder="kakao-bank"
            value={input.id}
            disabled={isEditing}
            onChange={(event) => patch({ id: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>이름</span>
          <input
            className={shared.input}
            placeholder="카카오뱅크"
            value={input.name}
            onChange={(event) => patch({ name: event.target.value })}
          />
        </label>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>분류</span>
          <FilterSelect
            label="분류"
            hasAllOption={false}
            options={categories.map((category) => ({ value: category.id, label: category.label }))}
            value={input.category || null}
            onChange={(category) => category && patch({ category })}
          />
        </div>
      </div>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>DART 고유번호 (8자리, 공시 없으면 비움)</span>
          <input
            className={shared.input}
            placeholder="00258801"
            inputMode="numeric"
            value={input.dartCorpCode}
            onChange={(event) => patch({ dartCorpCode: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>사업자번호 앞 6자리 (DART 없으면 필수)</span>
          <input
            className={shared.input}
            placeholder="120814"
            inputMode="numeric"
            value={input.businessNumberPrefix}
            onChange={(event) => patch({ businessNumberPrefix: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>국민연금 검색어 (못 찾을 때만)</span>
          <input
            className={shared.input}
            placeholder="네이버"
            value={input.pensionSearchName}
            onChange={(event) => patch({ pensionSearchName: event.target.value })}
          />
        </label>
      </div>
      <div className={styles.buttonRow}>
        <Button color="primary" variant="fill" size="small" loading={isPending} disabled={isPending} onClick={save}>
          {isEditing ? '연결 저장' : '더하고 모으기'}
        </Button>
        {isEditing && (
          <>
            <Button color="primary" variant="weak" size="small" disabled={isPending} onClick={collect}>
              지금 모으기
            </Button>
            <Button color="danger" variant="weak" size="small" disabled={isPending} onClick={remove}>
              목록에서 빼기
            </Button>
          </>
        )}
        {!isEditing && (
          <span className={styles.hint}>
            DART 고유번호를 모르면 비우고 사업자번호 앞 6자리만 적어도 직원 수는 모읍니다.
          </span>
        )}
      </div>
      {failure && <p className={styles.failure}>{failure}</p>}
    </div>
  )
}
