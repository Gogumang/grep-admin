'use client'

import { useState, useTransition } from 'react'
import { Badge, Button, useDialog, useToast } from '@/shared'
import type { DeviceEnrollmentRequest, ManagedDevice } from '@/lib/collector'
import { approveDevice, rejectDeviceEnrollment, removeDevice, type ActionResult } from './actions'
import * as styles from '@/components/shared.css'

const dateTimeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatTime(value: string | null): string {
  return value ? dateTimeFormat.format(new Date(value)) : '—'
}

/** thumbprint 는 43자라 표에 다 넣으면 줄이 깨진다. 앞뒤만 보여도 두 기기를 구분하기에 충분하다. */
function shortThumbprint(thumbprint: string): string {
  return thumbprint.length > 16 ? `${thumbprint.slice(0, 8)}…${thumbprint.slice(-6)}` : thumbprint
}

export function DeviceManager({
  devices,
  enrollmentRequests,
}: {
  devices: ManagedDevice[]
  enrollmentRequests: DeviceEnrollmentRequest[]
}) {
  const { openToast } = useToast()
  const { openConfirm } = useDialog()
  /** 실패는 고칠 때까지 화면에 남긴다. 성공은 토스트로 흘려보낸다. */
  const [failure, setFailure] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function perform(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const outcome = await action()
      if (outcome.ok) {
        openToast(outcome.message)
        setFailure(null)
      } else {
        setFailure(outcome.message)
      }
    })
  }

  async function confirmApprove(request: DeviceEnrollmentRequest) {
    const confirmed = await openConfirm({
      title: `${request.name}을(를) 등록할까요?`,
      description: `thumbprint ${request.thumbprint} — 요청한 Mac 의 go-runner 설정에 보이는 값과 같은지 확인하세요. 다르면 다른 사람이 보낸 요청입니다.`,
      confirmButton: '등록',
    })
    if (confirmed) perform(() => approveDevice(request.thumbprint, request.name))
  }

  async function confirmRemove(device: ManagedDevice) {
    const confirmed = await openConfirm({
      title: `${device.name}을(를) 삭제할까요?`,
      description: device.isCurrent
        ? '지금 쓰고 있는 기기입니다. 삭제하면 이 화면도 바로 잠기고, 다른 등록된 Mac 에서 다시 승인해야 들어올 수 있습니다.'
        : '그 Mac 에서 열려 있던 어드민이 바로 잠깁니다. 다시 쓰려면 go-runner 에서 등록을 다시 요청해야 합니다.',
      confirmButton: '삭제',
    })
    if (confirmed) perform(() => removeDevice(device.thumbprint, device.name))
  }

  return (
    <>
      {failure && <p className={styles.errorNotice}>{failure}</p>}

      <h2 className={styles.pageTitle}>승인 대기</h2>
      {enrollmentRequests.length === 0 ? (
        <p className={styles.notice}>
          대기 중인 요청이 없습니다. 새 Mac 에서 go-runner 설정 → 일반 → 기기 신뢰의 &lsquo;이 Mac 등록 요청&rsquo;을 누르면
          여기에 나타납니다 (10분 안에 승인).
        </p>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHead}>이름</th>
                <th className={styles.tableHead}>thumbprint</th>
                <th className={styles.tableHead}>요청 시각</th>
                <th className={styles.tableHead} />
              </tr>
            </thead>
            <tbody>
              {enrollmentRequests.map((request) => (
                <tr key={request.thumbprint}>
                  <td className={styles.tableCell}>{request.name}</td>
                  <td className={styles.tableCell}>
                    <code title={request.thumbprint}>{shortThumbprint(request.thumbprint)}</code>
                  </td>
                  <td className={styles.tableCell}>{formatTime(request.requestedAt)}</td>
                  <td className={`${styles.tableCell} ${styles.actionCell}`}>
                    <Button size="small" color="primary" variant="weak" disabled={isPending} onClick={() => confirmApprove(request)}>
                      승인
                    </Button>{' '}
                    <Button
                      size="small"
                      color="dark"
                      variant="weak"
                      disabled={isPending}
                      onClick={() => perform(() => rejectDeviceEnrollment(request.thumbprint, request.name))}
                    >
                      거절
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className={styles.pageTitle}>등록된 기기</h2>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHead}>이름</th>
              <th className={styles.tableHead}>thumbprint</th>
              <th className={styles.tableHead}>등록</th>
              <th className={styles.tableHead}>마지막 신호</th>
              <th className={styles.tableHead} />
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.thumbprint}>
                <td className={styles.tableCell}>
                  {device.name}{' '}
                  {device.isCurrent && (
                    <Badge size="xsmall" color="blue" variant="weak">
                      지금 이 기기
                    </Badge>
                  )}
                </td>
                <td className={styles.tableCell}>
                  <code title={device.thumbprint}>{shortThumbprint(device.thumbprint)}</code>
                </td>
                <td className={styles.tableCell}>
                  {device.source === 'configuration' ? (
                    <Badge size="xsmall" color="elephant" variant="weak" title="collector 설정(COLLECTOR_DEVICE_KEYS)으로 등록 — 설정에서만 뺄 수 있습니다">
                      설정
                    </Badge>
                  ) : (
                    formatTime(device.registeredAt)
                  )}
                </td>
                <td className={styles.tableCell}>{formatTime(device.lastSeenAt)}</td>
                <td className={`${styles.tableCell} ${styles.actionCell}`}>
                  {device.source === 'approved' && (
                    <Button size="small" color="danger" variant="weak" disabled={isPending} onClick={() => confirmRemove(device)}>
                      삭제
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
