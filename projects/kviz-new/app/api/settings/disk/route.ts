// app/api/settings/disk/route.ts — informace o využití disku a velkých souborech
import { NextRequest, NextResponse } from 'next/server'
import { readdirSync, statSync, unlinkSync, existsSync } from 'fs'
import path from 'path'
import { questions } from '@/lib/database'

function getUploadsDir(): string {
  return path.join(process.cwd(), 'data', 'uploads')
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function GET() {
  try {
    const uploadsDir = getUploadsDir()
    let totalBytes = 0
    let fileCount = 0
    const uploadFiles: { filename: string; size: number; sizeStr: string }[] = []

    if (existsSync(uploadsDir)) {
      const files = readdirSync(uploadsDir)
      for (const filename of files) {
        try {
          const st = statSync(path.join(uploadsDir, filename))
          if (st.isFile()) {
            totalBytes += st.size
            fileCount++
            uploadFiles.push({ filename, size: st.size, sizeStr: formatBytes(st.size) })
          }
        } catch {}
      }
    }

    const allQuestions = (questions.getAll() as any[])
    const mediaQuestions = allQuestions
      .filter(q => q.media_url && q.media_url.startsWith('/api/media/'))
      .map(q => {
        const filename = q.media_url.replace('/api/media/', '')
        const fileInfo = uploadFiles.find(f => f.filename === filename)
        return {
          id: q.id, text: q.text, type: q.type, media_url: q.media_url,
          fileSize: fileInfo?.size ?? 0, fileSizeStr: fileInfo?.sizeStr ?? 'neznámá',
          fileExists: !!fileInfo,
        }
      })
      .sort((a, b) => b.fileSize - a.fileSize)

    const referencedFiles = new Set(
      allQuestions
        .filter(q => q.media_url?.startsWith('/api/media/'))
        .map(q => q.media_url.replace('/api/media/', ''))
    )
    const orphanedFiles = uploadFiles
      .filter(f => !referencedFiles.has(f.filename))
      .sort((a, b) => b.size - a.size)

    return NextResponse.json({ totalBytes, totalStr: formatBytes(totalBytes), fileCount, mediaQuestions, orphanedFiles })
  } catch (err) {
    console.error('Disk stats error:', err)
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionIds, orphanedFiles: orphanFiles } = body as { questionIds?: string[]; orphanedFiles?: string[] }
    const uploadsDir = getUploadsDir()
    const deleted: string[] = []

    if (questionIds?.length) {
      for (const qId of questionIds) {
        const q = (questions.getById(qId) as any)
        if (!q) continue
        if (q.media_url?.startsWith('/api/media/')) {
          const filename = q.media_url.replace('/api/media/', '')
          const filepath = path.join(uploadsDir, filename)
          if (existsSync(filepath)) try { unlinkSync(filepath) } catch {}
        }
        questions.delete(qId)
        deleted.push(`question:${qId}`)
      }
    }

    if (orphanFiles?.length) {
      for (const filename of orphanFiles) {
        if (filename.includes('..') || filename.includes('/') || filename.includes('\')) continue
        const filepath = path.join(uploadsDir, filename)
        if (existsSync(filepath)) try { unlinkSync(filepath); deleted.push(`file:${filename}`) } catch {}
      }
    }

    return NextResponse.json({ deleted })
  } catch (err) {
    console.error('Delete error:', err)
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}
