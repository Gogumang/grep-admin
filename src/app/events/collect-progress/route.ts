import { NextResponse } from 'next/server'
import { collector } from '@/lib/collector'
import { requireAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * 도는 행사 수집의 단계별 진행. '다시 가져오기' 창이 수집(서버 액션)을 기다리는 동안 1초마다 읽는다.
 *
 * 서버 액션이 아니라 경로로 둔 것은 서버 액션이 한 화면에서 차례로만 돌기 때문이다 — 수집 액션이 도는 동안
 * 진행을 묻는 액션은 수집이 끝날 때까지 줄을 선다.
 */
export async function GET() {
  await requireAdmin()
  try {
    const snapshot = await collector.eventCollectionProgress()
    return NextResponse.json(snapshot ?? null, { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 502, headers: { 'cache-control': 'no-store' } })
  }
}
