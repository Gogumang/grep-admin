'use client'

import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../components/Button'
import * as dialogStyles from './Dialog.css'
import * as toastStyles from './Toast.css'
import type {
  AsyncConfirmOptions,
  DialogControls,
  OpenToastOptions,
  ToastControls,
} from './types'

const DEFAULT_TOAST_DURATION = 3000
const TOAST_DURATION_WITH_BUTTON = 5000
const DEFAULT_TOAST_GAP = 24

interface ToastState extends OpenToastOptions {
  id: number
  message: ReactNode
}

interface DialogState extends AsyncConfirmOptions {
  kind: 'alert' | 'confirm'
  /** alert일 때만 쓰는 버튼. confirm은 confirmButton/cancelButton을 쓴다. */
  alertButton?: ReactElement | string
  settle: (confirmed: boolean) => void
}

const ToastContext = createContext<ToastControls | null>(null)
const DialogContext = createContext<DialogControls | null>(null)

/**
 * Toast·Dialog가 살 자리. TDS의 TDSMobileAITProvider 자리다.
 *
 * 두 개를 한 Provider에 담은 이유는 화면 위에 겹쳐 뜨는 것끼리 순서를 정해야 하기 때문이다 —
 * 다이얼로그가 토스트를 덮어야지, 반대가 되면 확인 버튼이 토스트에 가려 눌리지 않는다.
 * (z-index: Toast 1000 < Dialog 1100)
 *
 * layout.tsx의 body 안쪽을 감싸서 쓴다.
 */
export function OverlayProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // 서버에서는 document가 없다. 붙은 뒤에만 portal을 연다.
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastSeq = useRef(0)

  const closeToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setToast(null)
  }, [])

  const openToast = useCallback(
    (message: ReactNode, options: OpenToastOptions = {}) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      toastSeq.current += 1
      setToast({ id: toastSeq.current, message, ...options })

      const duration = options.duration ?? (options.button ? TOAST_DURATION_WITH_BUTTON : DEFAULT_TOAST_DURATION)
      timerRef.current = setTimeout(() => setToast(null), duration)
    },
    [],
  )

  // 화면을 떠날 때 타이머가 남으면 사라진 컴포넌트에 setState를 건다.
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const toastControls = useMemo<ToastControls>(() => ({ openToast, closeToast }), [openToast, closeToast])

  const dialogControls = useMemo<DialogControls>(() => {
    const open = (kind: 'alert' | 'confirm', options: AsyncConfirmOptions & { alertButton?: ReactElement | string }) =>
      new Promise<boolean>((resolve) => {
        setDialog({
          kind,
          ...options,
          settle: (confirmed) => {
            setDialog(null)
            setIsRunning(false)
            options.onExited?.()
            resolve(confirmed)
          },
        })
      })

    return {
      openAlert: (options) => open('alert', options).then(() => undefined),
      openConfirm: (options) => open('confirm', options),
      openAsyncConfirm: (options) => open('confirm', options),
    }
  }, [])

  // 다이얼로그가 열리면 Esc로 닫는다. 뜬 창을 키보드로 빠져나갈 길이 없으면 갇힌다.
  useEffect(() => {
    if (!dialog) return
    dialog.onEntered?.()

    function handleKeyDown(event: KeyboardEvent) {
      // 처리 중에는 닫지 않는다 — 요청이 도는 동안 창이 사라지면 결과를 알 길이 없다.
      if (event.key === 'Escape' && !isRunning) dialog?.settle(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dialog, isRunning])

  async function runAndSettle(confirmed: boolean) {
    if (!dialog || isRunning) return
    const handler = confirmed ? dialog.onConfirmClick : dialog.onCancelClick
    if (!handler) {
      dialog.settle(confirmed)
      return
    }

    setIsRunning(true)
    try {
      await handler()
      dialog.settle(confirmed)
    } catch (error) {
      // 실패했으면 창을 닫지 않는다. 닫아 버리면 사용자는 성공했다고 읽는다.
      setIsRunning(false)
      throw error
    }
  }

  return (
    <ToastContext.Provider value={toastControls}>
      <DialogContext.Provider value={dialogControls}>
        {children}

        {isMounted && toast
          ? createPortal(
              <div
                key={toast.id}
                className={[toastStyles.toast, toastStyles.position[toast.type ?? 'bottom']].join(' ')}
                style={{ [toast.type === 'top' ? 'top' : 'bottom']: toast.gap ?? DEFAULT_TOAST_GAP }}
                role="status"
                aria-live="polite"
              >
                <span className={toastStyles.message}>{toast.message}</span>
                {toast.button && (
                  <button
                    type="button"
                    className={toastStyles.action}
                    onClick={() => {
                      toast.button?.onClick()
                      closeToast()
                    }}
                  >
                    {toast.button.text}
                  </button>
                )}
              </div>,
              document.body,
            )
          : null}

        {isMounted && dialog
          ? createPortal(
              <div
                className={dialogStyles.dimmer}
                onClick={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (dialog.closeOnDimmerClick && !isRunning) dialog.settle(false)
                }}
              >
                <div className={dialogStyles.dialog} role="alertdialog" aria-modal="true" aria-label={undefined}>
                  <h2 className={dialogStyles.title}>{dialog.title}</h2>
                  {dialog.description && <p className={dialogStyles.description}>{dialog.description}</p>}

                  <div className={dialogStyles.buttons}>
                    {dialog.kind === 'confirm' &&
                      renderDialogButton({
                        given: dialog.cancelButton,
                        fallbackText: '취소',
                        loadingPropName: dialog.cancelButtonLoadingPropName,
                        // 취소는 로딩을 보여주지 않는다 — 도는 것이 둘이면 어느 쪽을 기다리는지 알 수 없다.
                        loading: false,
                        disabled: isRunning,
                        onClick: () => void runAndSettle(false),
                        color: 'light',
                      })}
                    {renderDialogButton({
                      given: dialog.kind === 'alert' ? dialog.alertButton : dialog.confirmButton,
                      fallbackText: '확인',
                      loadingPropName: dialog.confirmButtonLoadingPropName,
                      loading: isRunning,
                      disabled: false,
                      onClick: () => void runAndSettle(true),
                      color: 'primary',
                    })}
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}
      </DialogContext.Provider>
    </ToastContext.Provider>
  )
}

/**
 * 다이얼로그 버튼 한 개. 글자를 주면 기본 Button을 그리고, 엘리먼트를 주면 그것을 그대로 쓰되
 * 눌렀을 때 다이얼로그가 닫히도록 onClick과 로딩 여부만 얹는다.
 *
 * 로딩 prop 이름을 밖에서 정할 수 있게 한 것은 TDS를 따른 것이다 — 넘긴 버튼이 우리 Button이
 * 아닐 수도 있어서(isLoading·pending 등) 이름을 고정하면 로딩이 조용히 사라진다.
 */
function renderDialogButton({
  given,
  fallbackText,
  loadingPropName = 'loading',
  loading,
  disabled,
  onClick,
  color,
}: {
  given: ReactElement | string | undefined
  fallbackText: string
  loadingPropName?: string
  loading: boolean
  disabled: boolean
  onClick: () => void
  color: 'primary' | 'light'
}) {
  if (isValidElement(given)) {
    return cloneElement(given as ReactElement<Record<string, unknown>>, {
      onClick,
      [loadingPropName]: loading,
      disabled,
    })
  }

  return (
    <Button color={color} size="medium" display="block" loading={loading} disabled={disabled} onClick={onClick}>
      {given ?? fallbackText}
    </Button>
  )
}

/** TDS의 useToast. OverlayProvider 안에서만 부를 수 있다. */
export function useToast(): ToastControls {
  const controls = useContext(ToastContext)
  if (!controls) throw new Error('useToast는 OverlayProvider 안에서만 쓸 수 있어요. layout.tsx를 확인하세요.')
  return controls
}

/** TDS의 useDialog. OverlayProvider 안에서만 부를 수 있다. */
export function useDialog(): DialogControls {
  const controls = useContext(DialogContext)
  if (!controls) throw new Error('useDialog는 OverlayProvider 안에서만 쓸 수 있어요. layout.tsx를 확인하세요.')
  return controls
}
