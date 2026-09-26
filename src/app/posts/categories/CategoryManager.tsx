'use client'

import { useState, useTransition } from 'react'
import { Button, useToast } from '@/shared'
import * as shared from '@/components/shared.css'
import type { PostCategoryChange, PostCategoryItem } from '@/lib/collector'
import { savePostCategories } from './actions'
import * as styles from './categories.css'

/** 화면이 들고 있는 한 줄. key 는 이름을 고치는 동안에도 줄을 알아보려고 따로 둔다. */
interface CategoryRow {
  key: string
  name: string
  /** 불러올 때의 이름. 새로 더한 줄은 null — 저장할 때 이름을 바꿨는지 가른다. */
  previousName: string | null
  keywords: string
  postCount: number
}

let nextRowKey = 0

function toRows(categories: PostCategoryItem[]): CategoryRow[] {
  return categories.map((category) => ({
    key: `row-${nextRowKey++}`,
    name: category.name,
    previousName: category.name,
    keywords: category.keywords,
    postCount: category.postCount,
  }))
}

function toChanges(rows: CategoryRow[]): PostCategoryChange[] {
  return rows.map(({ name, previousName, keywords }) => ({ name: name.trim(), previousName, keywords: keywords.trim() }))
}

/**
 * 글 분류 목록. 순서가 사이트 사이드바 순서다. 저장하면 collector 가 사이트와 DB 를 함께 고친다 —
 * 이름을 바꾸면 그 분류를 쓰던 글도 새 이름으로 옮겨 간다. 글이 남은 분류는 뺄 수 없다(collector 도 막는다).
 */
export function CategoryManager({ categories }: { categories: PostCategoryItem[] }) {
  const { openToast } = useToast()
  const [rows, setRows] = useState(() => toRows(categories))
  const [saved, setSaved] = useState(() => JSON.stringify(toChanges(toRows(categories))))
  /** 실패만 화면에 남긴다 — 저장이 안 됐는데 알림이 사라지면 된 줄로 읽는다. */
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const dirty = JSON.stringify(toChanges(rows)) !== saved

  const update = (key: string, patch: Partial<CategoryRow>) =>
    setRows((previous) => previous.map((row) => (row.key === key ? { ...row, ...patch } : row)))

  const move = (index: number, step: number) =>
    setRows((previous) => {
      const next = [...previous]
      const [row] = next.splice(index, 1)
      if (!row) return previous
      next.splice(index + step, 0, row)
      return next
    })

  const remove = (key: string) => setRows((previous) => previous.filter((row) => row.key !== key))

  const add = () =>
    setRows((previous) => [...previous, { key: `row-${nextRowKey++}`, name: '', previousName: null, keywords: '', postCount: 0 }])

  function save() {
    startTransition(async () => {
      const result = await savePostCategories(toChanges(rows))
      if (!result.ok || !result.categories) {
        setFailure(result.message)
        return
      }
      setFailure(null)
      openToast(result.message)
      const reloaded = toRows(result.categories)
      setRows(reloaded)
      setSaved(JSON.stringify(toChanges(reloaded)))
    })
  }

  return (
    <>
      <div className={shared.card}>
        <table className={shared.table}>
          <thead>
            <tr>
              <th className={shared.tableHead}>이름</th>
              <th className={shared.tableHead} title="새 글에 이 분류를 추천할 낱말. | 로 나누고 대소문자는 가리지 않아요 (예: spring|스프링|jpa). 비우면 추천하지 않아요.">
                추천 낱말
              </th>
              <th className={`${shared.tableHead} ${styles.countCell}`}>글</th>
              <th className={`${shared.tableHead} ${styles.actionsCell}`} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isRenamed = row.previousName !== null && row.previousName !== row.name.trim()
              return (
                <tr key={row.key}>
                  <td className={shared.tableCell}>
                    <input
                      className={`${shared.input} ${styles.nameInput}`}
                      value={row.name}
                      placeholder="분류 이름"
                      aria-label={`${index + 1}번째 분류 이름`}
                      onChange={(event) => update(row.key, { name: event.target.value })}
                    />
                    {isRenamed && <div className={shared.mutedText}>{row.previousName} 글이 옮겨 가요</div>}
                  </td>
                  <td className={shared.tableCell}>
                    <input
                      className={`${shared.input} ${styles.keywordsInput}`}
                      value={row.keywords}
                      placeholder="spring|스프링|jpa"
                      aria-label={`${row.name || '새 분류'} 추천 낱말`}
                      onChange={(event) => update(row.key, { keywords: event.target.value })}
                    />
                  </td>
                  <td className={`${shared.tableCell} ${styles.countCell}`}>{row.postCount.toLocaleString()}</td>
                  <td className={`${shared.tableCell} ${styles.actionsCell}`}>
                    <Button size="small" variant="weak" color="light" disabled={index === 0} onClick={() => move(index, -1)} aria-label="위로">
                      ↑
                    </Button>
                    <Button
                      size="small"
                      variant="weak"
                      color="light"
                      disabled={index === rows.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label="아래로"
                    >
                      ↓
                    </Button>
                    <Button
                      size="small"
                      variant="weak"
                      color="danger"
                      disabled={row.postCount > 0}
                      title={row.postCount > 0 ? '글이 남은 분류는 뺄 수 없어요 — 글을 다른 분류로 옮긴 뒤 빼세요' : undefined}
                      onClick={() => remove(row.key)}
                    >
                      빼기
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <Button size="small" variant="weak" onClick={add}>
          분류 더하기
        </Button>
        <Button color="primary" size="small" disabled={!dirty} loading={isPending} onClick={save}>
          {dirty ? '저장' : '고친 내용 없음'}
        </Button>
      </div>

      {failure && <p className={shared.errorNotice}>{failure}</p>}
    </>
  )
}
