import { GrepLogo } from '@/components/Logo'
import { requireAdminAccount } from '@/lib/session'
import * as styles from '../login/login.css'

export const dynamic = 'force-dynamic'

/** 실패 이유를 사용자 말로 옮긴다. 모르는 값이어도 화면을 비우지 않는다. */
const ERROR_MESSAGES: Record<string, string> = {
  missing_code: '연결 코드 없이 들어왔습니다. go-runner 에서 어드민 열기를 눌러 주세요.',
  invalid_handoff: '연결 코드가 만료됐거나 이미 쓰였습니다. go-runner 에서 어드민 열기를 다시 눌러 주세요.',
  collector_unreachable: 'collector 에 연결하지 못했습니다. 서버가 떠 있는지 확인해 주세요.',
}

/**
 * 기기 세션 없이 들어온 사람에게 보여주는 안내.
 *
 * 어드민은 등록된 Mac 에서 go-runner 가 켜져 있을 때만 쓸 수 있다. 여기서 세션을 여는 버튼을 두지 않는 이유 —
 * 브라우저는 그 Mac 인지 증명할 수 없다. 증명은 Secure Enclave 키를 가진 go-runner 만 한다.
 */
export default async function DevicePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdminAccount()
  const { error } = await searchParams
  const message = error ? (ERROR_MESSAGES[error] ?? '기기 세션을 열지 못했습니다. go-runner 에서 다시 시도해 주세요.') : null

  return (
    <div className={styles.page}>
      <div className={styles.wash} aria-hidden="true" />

      <header className={styles.header}>
        <GrepLogo />
      </header>

      <main className={styles.center}>
        <h1 className={styles.title}>go-runner 에서 열어 주세요</h1>

        <div className={styles.card}>
          {message ? (
            <p className={styles.alert} role="alert">
              {message}
            </p>
          ) : null}

          <p className={styles.cardLead}>
            어드민은 등록된 Mac 에서만 열립니다. 메뉴 막대의 go-runner 를 누르고 <strong>어드민 열기</strong>를
            선택하면 이 화면이 대신 열립니다.
          </p>
          <p className={styles.cardLead}>go-runner 를 끄면 3분 안에 어드민이 잠깁니다.</p>
        </div>
      </main>
    </div>
  )
}
