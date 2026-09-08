import type { Metadata } from 'next'
import '@/styles/reset.css'
import { Shell } from '@/components/Shell'
import { OverlayProvider } from '@/shared'

export const metadata: Metadata = {
  title: 'grep 관리',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />

        {/*
          본문 폰트. 폰트 스택 1순위인데 싣지 않으면 Pretendard가 깔린 기기에서만 적용된다.
          dynamic-subset은 쓰인 글자의 조각만 받아 온다(한글 전체는 몇 MB다).

          Tossface와 한 몸이라 함께 싣는다 — tossface.css에는 unicode-range가 U+0-10FFFF인
          face가 있어서, Pretendard가 없으면 숫자까지 Tossface가 가져가 "2 0 2 6년"처럼 벌어진다.
        */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />

        {/*
          토스가 공개한 이모지 폰트. 1️⃣ 같은 글자를 사이트와 같은 모양으로 그린다 —
          시스템 이모지로 두면 OS마다 다르고, macOS에서는 입체 광택 모양이라 글과 겉돈다.

          사이트(grep)의 BaseLayout과 같은 주소·같은 스택 위치를 쓴다. 두 화면이 다른 이모지를
          그리면 어드민 미리보기가 실제와 갈라져서 미리보기의 존재 이유가 없어진다.
        */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/toss/tossface@main/dist/tossface.css" />
      </head>
      <body>
        {/* 토스트·다이얼로그는 화면 어디서든 열 수 있어야 하므로 Shell 바깥을 감싼다. */}
        <OverlayProvider>
          <Shell>{children}</Shell>
        </OverlayProvider>
      </body>
    </html>
  )
}
