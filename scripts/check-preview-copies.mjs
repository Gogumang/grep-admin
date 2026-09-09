/**
 * 미리보기 복사본이 사이트 원본과 어긋났는지 본다.
 *
 * 어드민의 미리보기(src/components/preview/*)는 공개 사이트 컴포넌트를 복사한 것이다.
 * 저장소가 나뉘어 있어 import 할 수 없어서 그렇게 뒀는데, 복사본은 조용히 낡는다 —
 * 실제로 히어로 슬라이드의 반응형 규칙 두 개가 사이트에만 생겨서, 좁은 화면 미리보기가
 * 실제와 달랐다. 사람 눈으로는 안 잡힌다.
 *
 * 그래서 기계가 본다. 어긋나면 무엇이 다른지 찍고 1로 끝난다.
 *
 * 사이트 저장소가 옆에 없으면(다른 기계, CI) 그냥 건너뛴다 — 이건 손으로 돌리는 점검이지
 * 빌드를 막는 관문이 아니다. 막으려면 저장소를 합치거나 패키지로 뽑는 것이 맞다.
 *
 * 실행:  pnpm check:preview-copies
 * 사이트 경로:  GREP_SITE_PATH 로 바꿀 수 있다 (기본은 ../grep)
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const adminRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const siteRoot = process.env.GREP_SITE_PATH ?? resolve(adminRoot, '../grep')

/**
 * 복사본과 원본의 짝.
 *
 * `allowedDifferences` 는 옮기면서 반드시 달라지는 줄이다 — 어드민에는 사이트의 @/shared 가
 * 없다. 이 목록에 없는 차이가 나오면 낡은 것으로 본다.
 */
const PAIRS = [
  {
    copy: 'src/components/preview/todayPicks.css.ts',
    origin: 'src/components/post/TodayPicks.css.ts',
  },
  {
    copy: 'src/components/preview/postBody.css.ts',
    origin: 'src/styles/post.css.ts',
  },
]

/** 옮기면서 달라지는 것들을 지워 같은 잣대로 만든다. */
function normalize(source) {
  return source
    // 파일 맨 앞 주석 블록(어디서 옮겼는지 적어 둔 곳)은 복사본에만 있다.
    .replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '')
    // 어드민에는 @/shared 가 없다.
    .replace(/@\/shared\/styles\//g, '@/styles/')
    .replace(/\r\n/g, '\n')
    .trim()
}

if (!existsSync(siteRoot)) {
  console.log(`사이트 저장소가 없어 건너뜁니다: ${siteRoot}`)
  console.log('GREP_SITE_PATH 로 경로를 지정할 수 있습니다.')
  process.exit(0)
}

let stale = 0

for (const { copy, origin } of PAIRS) {
  const copyPath = resolve(adminRoot, copy)
  const originPath = resolve(siteRoot, origin)

  if (!existsSync(originPath)) {
    console.error(`✗ ${copy}\n    원본이 없습니다: ${originPath} (사이트에서 옮겨졌거나 이름이 바뀐 듯)`)
    stale += 1
    continue
  }

  const left = normalize(readFileSync(copyPath, 'utf8'))
  const right = normalize(readFileSync(originPath, 'utf8'))

  if (left === right) {
    console.log(`✓ ${copy}`)
    continue
  }

  stale += 1
  console.error(`✗ ${copy}  —  ${origin} 과 다릅니다`)

  // 어느 줄이 다른지만 짚는다. 전체 diff 는 git 이 더 잘 보여준다.
  const leftLines = left.split('\n')
  const rightLines = right.split('\n')
  for (let i = 0; i < Math.max(leftLines.length, rightLines.length); i += 1) {
    if (leftLines[i] === rightLines[i]) continue
    console.error(`    ${i + 1}번째 줄부터 갈라집니다`)
    console.error(`      복사본: ${leftLines[i] ?? '(없음)'}`)
    console.error(`      사이트: ${rightLines[i] ?? '(없음)'}`)
    break
  }
}

if (stale > 0) {
  console.error(`\n${stale}개가 낡았습니다. 사이트 원본을 다시 옮기세요.`)
  process.exit(1)
}

console.log('\n미리보기 복사본이 사이트와 같습니다.')
