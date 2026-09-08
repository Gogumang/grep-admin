import type { ReactElement, ReactNode } from 'react'

export interface ToastButton {
  text: string
  onClick: () => void
}

export interface OpenToastOptions {
  /** 화면 위/아래 어디에 뜰지. TDS와 같은 이름이라 position이 아니라 type이다. */
  type?: 'top' | 'bottom'
  /** 화면 끝에서 띄울 거리(px). 주지 않으면 24px. */
  gap?: number
  button?: ToastButton
  /** 자동으로 사라지기까지의 ms. 기본은 버튼 없으면 3000, 있으면 5000. */
  duration?: number
}

export interface ToastControls {
  openToast: (message: ReactNode, options?: OpenToastOptions) => void
  closeToast: () => void
}

export interface AlertOptions {
  title: ReactNode
  description?: ReactNode
  /** 글자만 주면 기본 버튼이 그려지고, 엘리먼트를 주면 그 버튼을 그대로 쓴다 (색을 바꿀 때). */
  alertButton?: ReactElement | string
  closeOnDimmerClick?: boolean
  onEntered?: () => void
  onExited?: () => void
}

export interface ConfirmOptions extends Omit<AlertOptions, 'alertButton'> {
  confirmButton?: ReactElement | string
  cancelButton?: ReactElement | string
}

export interface AsyncConfirmOptions extends ConfirmOptions {
  onConfirmClick?: () => Promise<void>
  onCancelClick?: () => Promise<void>
  /** 직접 넘긴 버튼 엘리먼트에 로딩 여부를 어떤 prop으로 꽂을지. 기본은 loading. */
  confirmButtonLoadingPropName?: string
  cancelButtonLoadingPropName?: string
}

export interface DialogControls {
  /** 확인 버튼을 누를 때까지 기다린다. */
  openAlert: (options: AlertOptions) => Promise<void>
  /** 확인이면 true, 취소·바깥 클릭이면 false. */
  openConfirm: (options: ConfirmOptions) => Promise<boolean>
  /**
   * 확인을 누르면 onConfirmClick이 끝날 때까지 버튼이 로딩 상태로 남는다.
   * 되돌릴 수 없는 작업에서 같은 요청을 두 번 보내는 것을 막는 자리다.
   */
  openAsyncConfirm: (options: AsyncConfirmOptions) => Promise<boolean>
}
