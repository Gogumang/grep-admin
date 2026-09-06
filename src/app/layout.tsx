import type { Metadata } from 'next'
import '@/styles/reset.css'
import { Shell } from '@/components/Shell'

export const metadata: Metadata = {
  title: 'grep 관리',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
