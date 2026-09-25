'use client'

import { useRouter } from 'next/navigation'
import { FilterSelect } from '@/shared'

/**
 * 회사 고르기. 고른 회사는 주소(?org=)에 두므로 값을 쥐지 않고 주소만 바꾼다.
 * 늘 한 곳이 골라져 있는 화면이라 "전체" 줄은 끈다.
 */
export function CompanySelect({
  companies,
  selectedLogin,
}: {
  companies: { login: string; company: string }[]
  selectedLogin: string | null
}) {
  const router = useRouter()

  return (
    <FilterSelect
      label="회사"
      hasAllOption={false}
      options={companies.map((summary) => ({ value: summary.login, label: summary.company }))}
      value={selectedLogin}
      onChange={(login) => {
        if (login) router.push(`/companies?org=${encodeURIComponent(login)}`)
      }}
    />
  )
}
