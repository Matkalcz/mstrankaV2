import { NextRequest, NextResponse } from 'next/server'
import { tags } from '@/lib/database'

// GET /api/tags/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tag = tags.getById(id)
    if (!tag) return NextResponse.json({ error: 'Tag nenalezen' }, { status: 404 })
    return NextResponse.json(tag)
  } catch (error) {
    console.error('GET /api/tags/[id] error:', error)
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 })
  }
}

// PUT /api/tags/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = tags.getById(id)
    if (!existing) return NextResponse.json({ error: 'Tag nenalezen' }, { status: 404 })

    const data = await request.json()
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Název tagu je povinný' }, { status: 400 })
    }
    tags.update(id, {
      name: data.name.trim(),
      description: data.description || '',
      color: data.color || '#3b82f6',
      icon: data.icon || '',
    })
    return NextResponse.json(tags.getById(id))
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Tag s tímto názvem již existuje' }, { status: 409 })
    }
    console.error('PUT /api/tags/[id] error:', error)
    return NextResponse.json({ error: 'Nepodařilo se aktualizovat tag' }, { status: 500 })
  }
}

// DELETE /api/tags/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = tags.getById(id)
    if (!existing) return NextResponse.json({ error: 'Tag nenalezen' }, { status: 404 })
    tags.delete(id)
    return NextResponse.json({ message: 'Tag smazán' })
  } catch (error: any) {
    if (error?.message?.includes('nelze jej smazat')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('DELETE /api/tags/[id] error:', error)
    return NextResponse.json({ error: 'Nepodařilo se smazat tag' }, { status: 500 })
  }
}
