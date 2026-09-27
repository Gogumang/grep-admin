'use client'

import { FUNCTION_VALUE_TYPES, type FunctionValueType } from '@/lib/codingLanguages'
import { Button, FilterSelect } from '@/shared'
import * as shared from '@/components/shared.css'
import * as styles from './coding.css'
import { emptyParameter, type ParameterDraft, type ProblemDraft } from './problemDraft'

const TYPE_OPTIONS = FUNCTION_VALUE_TYPES.map((type) => ({ value: type, label: type }))

type FunctionFields = Pick<ProblemDraft, 'functionName' | 'functionParameters' | 'functionReturnType'>

/**
 * 함수 방식 문제에서 채울 함수의 모양(이름·매개변수·반환 타입). 사이트 편집기의 뼈대와 채점 하네스가 이 모양대로 만들어진다.
 * 매개변수 순서가 곧 케이스 입력의 줄 순서다.
 */
export function FunctionSignatureEditor({
  value,
  onChange,
}: {
  value: FunctionFields
  onChange: (next: Partial<FunctionFields>) => void
}) {
  const changeParameter = (key: string, next: Partial<ParameterDraft>) =>
    onChange({
      functionParameters: value.functionParameters.map((parameter) => (parameter.key === key ? { ...parameter, ...next } : parameter)),
    })

  const removeParameter = (key: string) =>
    onChange({ functionParameters: value.functionParameters.filter((parameter) => parameter.key !== key) })

  return (
    <div className={styles.caseList}>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>함수 이름</span>
          <input
            className={shared.input}
            value={value.functionName}
            placeholder="solution"
            onChange={(event) => onChange({ functionName: event.target.value })}
          />
        </label>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>반환 타입</span>
          <FilterSelect
            label="반환 타입"
            options={TYPE_OPTIONS}
            value={value.functionReturnType}
            hasAllOption={false}
            onChange={(type) => type && onChange({ functionReturnType: type as FunctionValueType })}
          />
        </div>
      </div>

      {value.functionParameters.map((parameter, index) => (
        <div key={parameter.key} className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>매개변수 {index + 1} 이름 (케이스 입력 {index + 1}번째 줄)</span>
            <input
              className={shared.input}
              value={parameter.name}
              placeholder="numbers"
              onChange={(event) => changeParameter(parameter.key, { name: event.target.value })}
            />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>타입</span>
            <FilterSelect
              label="타입"
              options={TYPE_OPTIONS}
              value={parameter.type}
              hasAllOption={false}
              onChange={(type) => type && changeParameter(parameter.key, { type: type as FunctionValueType })}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>&nbsp;</span>
            <Button color="danger" variant="weak" size="small" onClick={() => removeParameter(parameter.key)}>
              매개변수 빼기
            </Button>
          </div>
        </div>
      ))}

      <div>
        <Button
          color="dark"
          variant="weak"
          size="small"
          onClick={() => onChange({ functionParameters: [...value.functionParameters, emptyParameter()] })}
        >
          매개변수 더하기
        </Button>
      </div>
    </div>
  )
}
