'use client'

import { useRouter } from 'next/navigation'
import { FilterSelect } from '@/shared'

/**
 * 조직 고르기. 고른 조직은 주소(?org=)에 두므로 값을 쥐지 않고 주소만 바꾼다.
 * 늘 한 곳이 골라져 있는 화면이라 "전체" 줄은 끈다.
 */
export function OrganizationSelect({
  organizations,
  selectedLogin,
}: {
  organizations: { login: string; name: string }[]
  selectedLogin: string
}) {
  const router = useRouter()

  return (
    <FilterSelect
      label="조직"
      hasAllOption={false}
      options={organizations.map((organization) => ({ value: organization.login, label: organization.name }))}
      value={selectedLogin}
      onChange={(login) => {
        if (login) router.push(`/organizations?org=${encodeURIComponent(login)}`)
      }}
    />
  )
}
