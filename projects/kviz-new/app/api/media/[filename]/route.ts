// app/api/media/[filename]/route.ts — slouží nahrané soubory z data/uploads/
// Podporuje HTTP Range requesty (206 Partial Content) pro správné streamování videa/audia
import { NextRequest, NextResponse } from 'next/server'
import { stat, unlink } from 'fs/promises'
import { existsSync, createReadStream } from 'fs'
import path from 'path'

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav',
  ogv: 'video/ogg', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
}

function nodeStreamToWeb(nodeStream: ReturnType<typeof createReadStream>): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) =>
        controller.enqueue(chunk instanceof Buffer ? chunk : Buffer.from(chunk as string))
      )
      nodeStream.on('end', () => controller.close())
      nodeStream.on('error', (err) => controller.error(err))
    },
    cancel() { nodeStream.destroy() },
  })
}

export async function GET(
  request: NextRequest,
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
    const fileSize = fileStat.size

    const rangeHeader = request.headers.get('range')

    if (rangeHeader) {
      // Parsuj Range: "bytes=start-end"
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
      if (match) {
        const start = parseInt(match[1], 10)
        const end = match[2] ? Math.min(parseInt(match[2], 10), fileSize - 1) : fileSize - 1
        if (start > end || start >= fileSize) {
          return new NextResponse(null, {
            status: 416,
            headers: { 'Content-Range': `bytes */${fileSize}` },
          })
        }
        const chunkSize = end - start + 1
        const stream = createReadStream(filepath, { start, end })
        return new NextResponse(nodeStreamToWeb(stream), {
          status: 206,
          headers: {
            'Content-Type': contentType,
            'Content-Length': String(chunkSize),
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    }

    // Celý soubor — stále streamujeme, bez načítání do bufferu
    const stream = createReadStream(filepath)
    return new NextResponse(nodeStreamToWeb(stream), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
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
