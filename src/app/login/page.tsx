import { redirect } from 'next/navigation'
import { getSessionUser, isAllowedAdmin } from '@/lib/session'
import { signInWithGitHub, signOut } from './actions'
import { GrepLogo } from '@/components/Logo'
import { SignInButton } from './SignInButton'
import * as styles from './login.css'

export const dynamic = 'force-dynamic'

/** 실패 이유를 사용자 말로 옮긴다. 모르는 값이어도 화면을 비우지 않는다. */
const ERROR_MESSAGES: Record<string, string> = {
  not_allowed: '이 GitHub 계정은 어드민에 등록되어 있지 않습니다.',
  missing_code: '로그인이 중간에 끊겼습니다. 다시 시도해 주세요.',
  exchange_failed: '로그인 정보를 확인하지 못했습니다. 다시 시도해 주세요.',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getSessionUser()

  // 이미 통과한 사람이 로그인 화면에 머물 이유가 없다.
  if (user && isAllowedAdmin(user)) redirect('/')

  const { error } = await searchParams

  // 로그인은 됐는데 허용 목록에 없는 경우, 제목과 계정 칩이 이미 그 사실을 말한다.
  // 같은 말을 알림으로 한 번 더 하지 않는다.
  const isBlockedAccount = Boolean(user) && error === 'not_allowed'
  const message = error && !isBlockedAccount ? (ERROR_MESSAGES[error] ?? '로그인에 실패했습니다.') : null

  const githubName = user?.user_metadata?.user_name as string | undefined
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <div className={styles.page}>
      <div className={styles.wash} aria-hidden="true" />

      <header className={styles.header}>
        <GrepLogo />
      </header>

      <main className={styles.center}>
        <h1 className={styles.title}>{user ? '들어올 수 없는 계정이에요' : 'GitHub 계정으로 로그인'}</h1>

        <div className={styles.card}>
          {message ? (
            <p className={styles.alert} role="alert">
              {message}
            </p>
          ) : null}

          {user ? (
            <>
              <div className={styles.identity}>
                {avatarUrl ? (
                  <img className={styles.avatar} src={avatarUrl} alt="" width={36} height={36} />
                ) : null}
                <div>
                  <p className={styles.identityName}>{githubName ?? '알 수 없는 계정'}</p>
                  <p className={styles.identityNote}>GitHub로 로그인함</p>
                </div>
              </div>

              <p className={styles.cardLead}>어드민에 등록된 계정이 아닙니다.</p>

              <form action={signOut}>
                <button type="submit" className={styles.secondary}>
                  다른 계정으로 로그인
                </button>
              </form>
            </>
          ) : (
            <>
              <p className={styles.cardLead}>
                등록된 GitHub 계정으로만 들어올 수 있습니다.
              </p>
              <form action={signInWithGitHub}>
                <SignInButton />
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
