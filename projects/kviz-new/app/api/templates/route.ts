// app/api/templates/route.ts
import { NextResponse } from 'next/server'
import { templates } from '@/lib/database'

export async function GET() {
  try {
    const rows = templates.getAll() as any[]
    const parsed = rows.map(r => ({
      ...r,
      config: r.config ? JSON.parse(r.config) : null,
    }))
    return NextResponse.json(parsed)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Název šablony je povinný' }, { status: 400 })
    }
    const id = templates.create(body)
    const created = templates.getById(id) as any
    return NextResponse.json({
      ...created,
      config: created.config ? JSON.parse(created.config) : null,
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
