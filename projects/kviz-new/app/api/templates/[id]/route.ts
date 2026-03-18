// app/api/templates/[id]/route.ts
import { NextResponse } from 'next/server'
import { templates } from '@/lib/database'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const row = templates.getById(id) as any
    if (!row) return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    return NextResponse.json({ ...row, config: row.config ? JSON.parse(row.config) : null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const row = templates.getById(id)
    if (!row) return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    const body = await req.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Název šablony je povinný' }, { status: 400 })
    }
    templates.update(id, body)
    const updated = templates.getById(id) as any
    return NextResponse.json({ ...updated, config: updated.config ? JSON.parse(updated.config) : null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const row = templates.getById(id)
    if (!row) return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    templates.delete(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
