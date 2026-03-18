import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { questions } from '@/lib/database'

async function deleteMediaFile(mediaUrl: string | null | undefined) {
  if (!mediaUrl || !mediaUrl.startsWith('/api/media/')) return
  const filename = mediaUrl.split('/api/media/')[1]
  if (!filename || filename.includes('..') || filename.includes('/')) return
  const filepath = path.join(process.cwd(), 'data', 'uploads', filename)
  if (existsSync(filepath)) {
    await unlink(filepath).catch(() => {})
  }
}

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

    // If media_url changed, delete old server file
    const oldMediaUrl = (existing as any).media_url
    const newMediaUrl = data.media_url
    if (oldMediaUrl && newMediaUrl !== undefined && newMediaUrl !== oldMediaUrl) {
      await deleteMediaFile(oldMediaUrl)
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
    const mediaUrl = (existing as any).media_url
    questions.delete(id)
    await deleteMediaFile(mediaUrl)
    return NextResponse.json({ message: 'Otázka smazána' })
  } catch (error) {
    console.error('DELETE /api/questions/[id] error:', error)
    return NextResponse.json({ error: 'Nepodařilo se smazat otázku' }, { status: 500 })
  }
}
