'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CompanyCategory } from '@/lib/companyProfiles'
import { Button, TextButton } from '@/shared'
import * as dialogStyles from '@/shared/overlay/Dialog.css'
import { CompanyProfileForm } from './CompanyProfileForm'
import * as styles from './companyProfiles.css'

/** 회사 목록 제목 오른쪽 버튼. 누르면 더하기 창이 뜨고, 더하기에 성공하면 닫힌다(목록은 폼이 새로 고친다). */
export function AddCompanyButton({ categories }: { categories: CompanyCategory[] }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setIsOpen(false)
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [isOpen])

  return (
    <>
      <Button color="primary" variant="fill" size="small" onClick={() => setIsOpen(true)}>
        회사 더하기
      </Button>

      {isOpen &&
        createPortal(
          <div className={dialogStyles.dimmer} onClick={(event) => event.target === event.currentTarget && setIsOpen(false)}>
            <div
              className={`${dialogStyles.dialog} ${styles.addDialog}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-company-title"
            >
              <div className={styles.addDialogHeader}>
                <h2 id="add-company-title" className={dialogStyles.title}>
                  회사 더하기
                </h2>
                <TextButton size="small" onClick={() => setIsOpen(false)}>
                  닫기
                </TextButton>
              </div>
              <CompanyProfileForm categories={categories} isInDialog onAdded={() => setIsOpen(false)} />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
