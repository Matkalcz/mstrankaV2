import { NextRequest, NextResponse } from 'next/server'
import { questions } from '@/lib/database'

function parseQuestion(q: any) {
  if (!q) return null
  return {
    ...q,
    options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
  }
}

// GET /api/questions/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const question = questions.getById(id)
    if (!question) return NextResponse.json({ error: 'Otázka nenalezena' }, { status: 404 })
    return NextResponse.json(parseQuestion(question))
  } catch (error) {
    console.error('GET /api/questions/[id] error:', error)
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 })
  }
}

// PUT /api/questions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = questions.getById(id)
    if (!existing) return NextResponse.json({ error: 'Otázka nenalezena' }, { status: 404 })

    const data = await request.json()

    if (data.type) {
      const validTypes = ['simple', 'abcdef', 'bonus', 'audio', 'video', 'image']
      if (!validTypes.includes(data.type)) {
        return NextResponse.json({ error: `Neplatný typ otázky. Povolené: ${validTypes.join(', ')}` }, { status: 400 })
      }
    }

    questions.update(id, data)
    return NextResponse.json(parseQuestion(questions.getById(id)))
  } catch (error) {
    console.error('PUT /api/questions/[id] error:', error)
    return NextResponse.json({ error: 'Nepodařilo se aktualizovat otázku' }, { status: 500 })
  }
}

// DELETE /api/questions/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = questions.getById(id)
    if (!existing) return NextResponse.json({ error: 'Otázka nenalezena' }, { status: 404 })
    questions.delete(id)
    return NextResponse.json({ message: 'Otázka smazána' })
  } catch (error) {
    console.error('DELETE /api/questions/[id] error:', error)
    return NextResponse.json({ error: 'Nepodařilo se smazat otázku' }, { status: 500 })
  }
}
