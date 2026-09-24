'use client'

import { type RefObject, useEffect, useRef, useState, useTransition } from 'react'
import { Button, TextField, useDialog, useToast } from '@/shared'
import { featureEvent, unfeatureEvent } from './actions'
import * as styles from './events.css'

/**
 * 올리기 창의 확인 버튼은 창 바깥(OverlayProvider)이 그린다.
 * 그래서 값을 읽고 실패를 돌려줄 통로를 창 안쪽에서 이 모양으로 남긴다 (블로그 추가 창과 같은 방식).
 */
interface ImageUrlControl {
  read: () => string
  showError: (message: string) => void
}

function ImageUrlField({ control }: { control: RefObject<ImageUrlControl | null> }) {
  const imageUrl = useRef('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    control.current = { read: () => imageUrl.current, showError: setError }
    return () => {
      control.current = null
    }
  }, [control])

  return (
    <div className={styles.fieldStack}>
      <p className={styles.fieldHint}>
        주최 측 공식 사이트의 이미지 주소를 넣어 주세요. 티켓타코 포스터는 약관상 쓸 수 없습니다.
      </p>
      <TextField
        variant="box"
        label="이미지 주소"
        labelOption="sustain"
        placeholder="예: https://if.kakao.com/og.png"
        autoFocus
        onChange={(event) => {
          imageUrl.current = event.target.value
        }}
      />
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  )
}

/**
 * 행사 줄 오른쪽의 올리기·내리기.
 *
 * 올리면 collector가 이미지를 받아 R2에 올리고 사이트 저장소에 커밋한다 — 누르는 것 하나가 사이트 배포 한 번이다.
 * 이미 올린 행사도 "이미지 바꾸기"로 다시 올릴 수 있다.
 */
export function EventFeatureControl({
  eventId,
  title,
  isFeatured,
  endedOnly = false,
}: {
  eventId: string
  title: string
  isFeatured: boolean
  /** 끝난 행사. 내리기만 보인다. */
  endedOnly?: boolean
}) {
  const { openToast } = useToast()
  const { openAsyncConfirm, openConfirm } = useDialog()
  const [isPending, startTransition] = useTransition()
  const control = useRef<ImageUrlControl | null>(null)

  function openFeatureDialog() {
    void openAsyncConfirm({
      title: isFeatured ? `${title} 이미지 바꾸기` : `${title} 올리기`,
      description: <ImageUrlField control={control} />,
      confirmButton: isFeatured ? '바꾸기' : '올리기',
      closeOnDimmerClick: true,
      onConfirmClick: async () => {
        const outcome = await featureEvent(eventId, control.current?.read() ?? '')
        // 실패를 던지면 창이 닫히지 않는다. 방금 넣은 주소를 남겨 둔 채 그 자리에서 알린다.
        if (!outcome.ok) {
          control.current?.showError(outcome.message)
          throw new Error(outcome.message)
        }
        openToast(outcome.message)
      },
    })
  }

  async function unfeature() {
    const confirmed = await openConfirm({
      title: `${title}을(를) 내릴까요?`,
      description: '이벤트 페이지에서 빠집니다. 다시 올리려면 이미지 주소를 또 넣어야 합니다.',
      confirmButton: '내리기',
    })
    if (!confirmed) return

    startTransition(async () => {
      const outcome = await unfeatureEvent(eventId)
      openToast(outcome.message)
    })
  }

  return (
    <span className={styles.controls}>
      {!endedOnly && (
        <Button color="primary" variant="weak" size="small" onClick={openFeatureDialog} disabled={isPending}>
          {isFeatured ? '이미지 바꾸기' : '올리기'}
        </Button>
      )}
      {isFeatured && (
        <Button color="dark" variant="weak" size="small" onClick={unfeature} disabled={isPending}>
          내리기
        </Button>
      )}
    </span>
  )
}
