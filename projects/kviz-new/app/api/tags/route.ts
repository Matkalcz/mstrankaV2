import { NextRequest, NextResponse } from 'next/server'
import { tags } from '@/lib/database'

// GET /api/tags — seznam všech tagů
export async function GET() {
  try {
    return NextResponse.json(tags.getAll())
  } catch (error) {
    console.error('GET /api/tags error:', error)
    return NextResponse.json({ error: 'Nepodařilo se načíst tagy' }, { status: 500 })
  }
}

// POST /api/tags — vytvořit nový tag
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Název tagu je povinný' }, { status: 400 })
    }
    const id = tags.create({
      name: data.name.trim(),
      description: data.description || '',
      color: data.color || '#3b82f6',
      icon: data.icon || '',
    })
    return NextResponse.json(tags.getById(id), { status: 201 })
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Tag s tímto názvem již existuje' }, { status: 409 })
    }
    console.error('POST /api/tags error:', error)
    return NextResponse.json({ error: 'Nepodařilo se vytvořit tag' }, { status: 500 })
  }
}
