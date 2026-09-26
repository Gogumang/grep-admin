'use server'

import { revalidatePath } from 'next/cache'
import type { CodingLanguage } from '@/lib/codingLanguages'
import {
  collector,
  CollectorRequestError,
  type CodingProblem,
  type CodingProblemContent,
  type ReferenceRun,
} from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export interface ActionResult {
  ok: boolean
  message: string
}

/** 저장·공개·내리기는 바뀐 문제를 함께 돌려준다 — 편집 화면이 상태 배지와 '저장된 값'을 서버 기준으로 다시 잡는다. */
export interface ProblemActionResult extends ActionResult {
  problem?: CodingProblem
}

export interface ReferenceRunActionResult extends ActionResult {
  run?: ReferenceRun
}

function describe(error: unknown): string {
  if (error instanceof CollectorRequestError) return error.message
  return `알 수 없는 오류: ${(error as Error).message}`
}

function revalidateProblemScreens(problemId: string) {
  revalidatePath('/coding')
  revalidatePath(`/coding/${problemId}`)
}

/** 없으면 만들고 있으면 덮어쓴다. 케이스는 화면의 순서 그대로 통째로 바뀐다. */
export async function saveCodingProblem(problemId: string, content: CodingProblemContent): Promise<ProblemActionResult> {
  await requireAdmin()

  try {
    const problem = await collector.saveCodingProblem(problemId, content)
    revalidateProblemScreens(problemId)
    // 공개 중인 문제는 저장이 곧 사이트 반영이다 — 초안 저장과 무게가 달라서 문구를 나눈다.
    const message =
      problem.status === 'published' ? '저장했습니다. 공개 중인 문제라 곧 사이트에 반영됩니다.' : '저장했습니다.'
    return { ok: true, message, problem }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

/** 참조 풀이를 케이스 입력마다 돌린다. 기대 출력을 채우는 것은 화면의 몫이다 — 여기서는 결과만 넘긴다. */
export async function runReferenceSolution(run: {
  language: CodingLanguage
  code: string
  inputs: string[]
  timeLimitMs: number
  memoryLimitMb: number
}): Promise<ReferenceRunActionResult> {
  await requireAdmin()

  try {
    const result = await collector.runReferenceSolution(run)
    return { ok: true, message: '참조 풀이를 돌렸습니다.', run: result }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

export async function publishCodingProblem(problemId: string): Promise<ProblemActionResult> {
  await requireAdmin()

  try {
    const problem = await collector.publishCodingProblem(problemId)
    revalidateProblemScreens(problemId)
    return { ok: true, message: '공개했습니다. 곧 사이트에 반영됩니다.', problem }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}

export async function unpublishCodingProblem(problemId: string): Promise<ProblemActionResult> {
  await requireAdmin()

  try {
    const problem = await collector.unpublishCodingProblem(problemId)
    revalidateProblemScreens(problemId)
    return { ok: true, message: '사이트에서 내렸습니다. 곧 사이트에 반영됩니다.', problem }
  } catch (error) {
    return { ok: false, message: describe(error) }
  }
}
