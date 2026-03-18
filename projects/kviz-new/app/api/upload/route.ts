// app/api/upload/route.ts — nahrávání médií (obrázky, audio, video) na server
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
  'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg',
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/ogg': 'ogg',
  'audio/wav': 'wav', 'audio/x-wav': 'wav',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/ogg': 'ogv',
  'video/quicktime': 'mov',
}

const MAX_SIZE_MB = 200

function getUploadsDir(): string {
  return path.join(process.cwd(), 'data', 'uploads')
}

export async function POST(request: NextRequest) {
  try {
    const uploadsDir = getUploadsDir()
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Žádný soubor' }, { status: 400 })
    const mimeType = file.type
    const ext = ALLOWED_TYPES[mimeType]
    if (!ext) return NextResponse.json({ error: `Nepodporovaný typ: ${mimeType}` }, { status: 400 })
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Soubor je příliš velký (max ${MAX_SIZE_MB} MB)` }, { status: 400 })
    }
    const hash = crypto.randomBytes(12).toString('hex')
    const filename = `${hash}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadsDir, filename), buffer)
    return NextResponse.json({ url: `/api/media/${filename}` })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Chyba při nahrávání' }, { status: 500 })
  }
}
