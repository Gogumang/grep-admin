import { Badge, ListRow } from '@/shared'
import { findGithubAccounts } from '@/lib/githubAccounts'
import { listAllowedGithubIds, requireAdmin } from '@/lib/session'
import * as shared from '@/components/shared.css'
import * as console from '@/styles/console.css'
import * as styles from './admins.css'

export const dynamic = 'force-dynamic'

/** 어드민에 들어올 수 있는 GitHub 계정. 보여주기만 한다 — 목록은 환경변수에 있다. */
export default async function AdminsPage() {
  const user = await requireAdmin()
  const accounts = await findGithubAccounts(listAllowedGithubIds())
  const myGithubId = String(user.user_metadata?.provider_id ?? '')

  return (
    <>
      <h1 className={console.pageTitle}>허용 계정 {accounts.length}개</h1>
      <p className={shared.mutedText} style={{ marginBottom: 20 }}>
        추가·삭제는 Vercel 환경변수 ADMIN_ALLOWED_GITHUB_IDS(쉼표로 나열한 GitHub 숫자 id)를 바꾸고 다시 배포해야 반영됩니다.
      </p>

      <div className={shared.card}>
        {accounts.map((account) => (
          <ListRow
            key={account.id}
            border="none"
            left={
              account.avatarUrl ? (
                <img className={styles.avatar} src={account.avatarUrl} alt="" width={40} height={40} />
              ) : (
                <span className={styles.avatar} />
              )
            }
            contents={
              <ListRow.Texts
                title={
                  <>
                    {account.profileUrl ? (
                      <a className={styles.loginLink} href={account.profileUrl} target="_blank" rel="noreferrer">
                        {account.login}
                      </a>
                    ) : (
                      '계정 정보를 불러오지 못했습니다'
                    )}
                    {account.id === myGithubId && (
                      <span className={styles.badge}>
                        <Badge color="blue" variant="weak" size="xsmall">
                          나
                        </Badge>
                      </span>
                    )}
                  </>
                }
                description={[account.name, `id ${account.id}`].filter(Boolean).join(' · ')}
              />
            }
          />
        ))}
      </div>
    </>
  )
}
