import type { NextConfig } from 'next'
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'

const withVanillaExtract = createVanillaExtractPlugin({
  unstable_turbopack: { mode: 'auto' },
})

export default withVanillaExtract({
  // Next 16이 dev 실행마다 AGENTS.md·CLAUDE.md를 만들어 저장소에 떨군다. 이 저장소는
  // 그 파일들을 두지 않기로 했으므로 생성기 자체를 끈다 — 지워도 다음 실행에 되살아난다.
  agentRules: false,
} satisfies NextConfig)
