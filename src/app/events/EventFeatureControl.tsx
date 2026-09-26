'use client'

import { type RefObject, useEffect, useRef, useState, useTransition } from 'react'
import { Button, TextField, useDialog, useToast } from '@/shared'
import { featureEvent, publishEvent, suggestEventImage, unfeatureEvent } from './actions'
import * as styles from './events.css'

/**
 * 올리기 창의 확인 버튼은 창 바깥(OverlayProvider)이 그린다.
 * 그래서 값을 읽고 실패를 돌려줄 통로를 창 안쪽에서 이 모양으로 남긴다 (블로그 추가 창과 같은 방식).
 */
interface ImageUrlControl {
  read: () => string
  showError: (message: string) => void
}

type SuggestionState =
  | { status: 'searching' }
  | { status: 'found'; officialSiteUrl: string; isEventPageImage: boolean }
  | { status: 'none' }

/**
 * 창이 열리면 collector 가 티켓타코 행사 본문의 공식 사이트에서 대표 이미지를 찾아 칸을 채운다.
 * 사람이 먼저 뭔가 넣었으면 덮지 않는다. 채운 주소가 맞는지 미리보기로 보고 올린다.
 */
function ImageUrlField({ eventId, control }: { eventId: string; control: RefObject<ImageUrlControl | null> }) {
  const [imageUrl, setImageUrl] = useState('')
  const imageUrlRef = useRef('')
  const hasTyped = useRef(false)
  const [suggestion, setSuggestion] = useState<SuggestionState>({ status: 'searching' })
  const [error, setError] = useState<string | null>(null)

  function change(value: string) {
    imageUrlRef.current = value
    setImageUrl(value)
  }

  useEffect(() => {
    control.current = { read: () => imageUrlRef.current, showError: setError }
    return () => {
      control.current = null
    }
  }, [control])

  useEffect(() => {
    let isCurrent = true
    void suggestEventImage(eventId).then((found) => {
      if (!isCurrent) return
      if (!found) {
        setSuggestion({ status: 'none' })
        return
      }
      setSuggestion({ status: 'found', officialSiteUrl: found.officialSiteUrl, isEventPageImage: found.isEventPageImage })
      if (!hasTyped.current) change(found.imageUrl)
    })
    return () => {
      isCurrent = false
    }
  }, [eventId])

  // 티켓타코가 링크에 추적 파라미터(utm_source=ticketaco)를 붙여 두어 주소 그대로는 길다 — 도메인만 보인다.
  const siteName = suggestion.status === 'found' ? new URL(suggestion.officialSiteUrl).hostname.replace(/^www\./, '') : ''

  return (
    <div className={styles.fieldStack}>
      <p className={styles.fieldHint}>
        {suggestion.status === 'searching' && '공식 사이트에서 이미지를 찾는 중이에요…'}
        {suggestion.status === 'found' &&
          !suggestion.isEventPageImage &&
          `${siteName}의 대표 이미지를 채워 뒀어요. 맞는지 보고 올려 주세요.`}
        {suggestion.status === 'found' && suggestion.isEventPageImage && (
          <span className={styles.fieldWarning}>
            공식 사이트 이미지를 찾지 못해 티켓타코 행사 페이지 이미지를 채워 뒀어요. 티켓타코 약관(제11조)상 옮기면 안 되는
            콘텐츠일 수 있으니, 주최 측 이미지가 있으면 바꿔 넣어 주세요.
          </span>
        )}
        {suggestion.status === 'none' && '주최 측 공식 사이트의 이미지 주소를 넣어 주세요. 티켓타코 포스터는 약관상 쓸 수 없습니다.'}
      </p>
      <TextField
        variant="box"
        label="이미지 주소"
        labelOption="sustain"
        placeholder="예: https://if.kakao.com/og.png"
        autoFocus
        value={imageUrl}
        onChange={(event) => {
          hasTyped.current = true
          change(event.target.value)
        }}
      />
      {imageUrl.startsWith('https://') && (
        <img className={styles.imagePreview} src={imageUrl} alt="올릴 이미지 미리보기" width={228} height={128} />
      )}
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
  isNew = false,
}: {
  eventId: string
  title: string
  isFeatured: boolean
  /** 끝난 행사. 내리기만 보인다. */
  endedOnly?: boolean
  /** 새로 모은 행사. 올리면 후보 등록과 이벤트 페이지 반영을 한 번에 한다. */
  isNew?: boolean
}) {
  const { openToast } = useToast()
  const { openAsyncConfirm, openConfirm } = useDialog()
  const [isPending, startTransition] = useTransition()
  const control = useRef<ImageUrlControl | null>(null)

  function openFeatureDialog() {
    void openAsyncConfirm({
      title: isFeatured ? `${title} 이미지 바꾸기` : `${title} 올리기`,
      description: <ImageUrlField eventId={eventId} control={control} />,
      confirmButton: isFeatured ? '바꾸기' : '올리기',
      closeOnDimmerClick: true,
      onConfirmClick: async () => {
        const imageUrl = control.current?.read() ?? ''
        const outcome = isNew ? await publishEvent(eventId, imageUrl) : await featureEvent(eventId, imageUrl)
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
