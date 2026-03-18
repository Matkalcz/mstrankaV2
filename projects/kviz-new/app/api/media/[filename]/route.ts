// app/api/media/[filename]/route.ts — slouží nahrané soubory z data/uploads/
import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav',
  ogv: 'video/ogg', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Neplatný název souboru' }, { status: 400 })
    }
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads')
    const filepath = path.join(uploadsDir, filename)
    if (!existsSync(filepath)) return NextResponse.json({ error: 'Soubor nenalezen' }, { status: 404 })
    const ext = filename.split('.').pop()?.toLowerCase() ?? ''
    const contentType = MIME_MAP[ext] ?? 'application/octet-stream'
    const fileStat = await stat(filepath)
    const buffer = await readFile(filepath)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileStat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('Media serve error:', err)
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Neplatný název souboru' }, { status: 400 })
    }
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads')
    const filepath = path.join(uploadsDir, filename)
    if (existsSync(filepath)) {
      await unlink(filepath)
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Media delete error:', err)
    return NextResponse.json({ error: 'Chyba při mazání' }, { status: 500 })
  }
}
