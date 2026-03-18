import { NextRequest, NextResponse } from 'next/server'
import { questions } from '@/lib/database'

// GET /api/questions — seznam otázek (s tagy)
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const type = sp.get('type')
    const tag = sp.get('tag')

    let all = questions.getAll() as any[]

    if (type) all = all.filter(q => q.type === type)
    if (tag) all = all.filter(q => Array.isArray(q.tag_ids) && q.tag_ids.includes(tag))

    const parsed = all.map(q => ({
      ...q,
      options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('GET /api/questions error:', error)
    return NextResponse.json({ error: 'Nepodařilo se načíst otázky' }, { status: 500 })
  }
}

// POST /api/questions — vytvořit otázku
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.text || !data.type) {
      return NextResponse.json({ error: 'Chybí povinná pole: text a type' }, { status: 400 })
    }

    const validTypes = ['simple', 'abcdef', 'bonus', 'audio', 'video', 'image']
    if (!validTypes.includes(data.type)) {
      return NextResponse.json({ error: `Neplatný typ otázky. Povolené: ${validTypes.join(', ')}` }, { status: 400 })
    }

    if (data.type === 'simple' && !data.correct_answer) {
      return NextResponse.json({ error: 'Jednoduchá otázka vyžaduje correct_answer' }, { status: 400 })
    }
    if ((data.type === 'abcdef' || data.type === 'bonus') && (!data.options || !Array.isArray(data.options))) {
      return NextResponse.json({ error: 'Otázka vyžaduje pole options' }, { status: 400 })
    }
    if ((data.type === 'audio' || data.type === 'video') && !data.media_url) {
      return NextResponse.json({ error: 'Audio/video otázka vyžaduje media_url' }, { status: 400 })
    }
    if (data.type === 'image' && !data.media_url) {
      return NextResponse.json({ error: 'Obrázková otázka vyžaduje media_url' }, { status: 400 })
    }

    const id = questions.create(data)
    const created = questions.getById(id) as any
    return NextResponse.json({
      ...created,
      options: created?.options ? (typeof created.options === 'string' ? JSON.parse(created.options) : created.options) : [],
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/questions error:', error)
    return NextResponse.json({ error: 'Nepodařilo se vytvořit otázku' }, { status: 500 })
  }
}
