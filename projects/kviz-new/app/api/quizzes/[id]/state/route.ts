import { NextRequest, NextResponse } from 'next/server'
import { quizzes } from '@/lib/database'

// GET /api/quizzes/[id]/state — get current player state
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const state = quizzes.getPlayerState(id)
  return NextResponse.json(state ?? { slideIndex: 0, phase: 0 })
}

// PATCH /api/quizzes/[id]/state — moderator updates position
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const slideIndex = Number(body.slideIndex ?? 0)
  const phase = Number(body.phase ?? 0)
  quizzes.setPlayerState(id, { slideIndex, phase })
  return NextResponse.json({ slideIndex, phase })
}
