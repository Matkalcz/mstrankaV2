// app/api/active/route.ts — Globální aktivní kvíz (moderátor jej nastavuje, /start stránka čte)
import { NextRequest, NextResponse } from 'next/server'
import { appState } from '@/lib/database'

// GET — vrátí aktuální aktivní kvíz nebo null
export async function GET() {
  try {
    const raw = appState.get('active_quiz')
    if (!raw) return NextResponse.json(null)
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json(null)
  }
}

// PATCH — moderátor nastaví aktivní kvíz + aktuální pozici
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { quizId, slideIndex, phase } = body
    if (!quizId) {
      appState.delete('active_quiz')
      return NextResponse.json({ cleared: true })
    }
    const state = {
      quizId,
      slideIndex: Number(slideIndex ?? 0),
      phase: Number(phase ?? 0),
    }
    appState.set('active_quiz', JSON.stringify(state))
    return NextResponse.json(state)
  } catch {
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}

// DELETE — moderátor zavřel kvíz, veřejná adresa přejde zpět na čekací obrazovku
export async function DELETE() {
  try {
    appState.delete('active_quiz')
    return NextResponse.json({ cleared: true })
  } catch {
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}
