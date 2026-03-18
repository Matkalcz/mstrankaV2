// app/api/settings/server-disk/route.ts — celkové využití disku serveru (df)
import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

export async function GET() {
  try {
    // df -k vrátí bloky v KB; parsujeme řádek pro kořenový filesystem
    const output = execSync("df -k / 2>/dev/null | tail -1", { timeout: 5000 }).toString().trim()
    // Filesystem  1K-blocks   Used  Available  Use%  Mounted
    const parts = output.split(/\s+/)
    if (parts.length < 5) throw new Error('Unexpected df output: ' + output)

    const totalKB = parseInt(parts[1], 10)
    const usedKB  = parseInt(parts[2], 10)
    const freeKB  = parseInt(parts[3], 10)
    const pct     = Math.round((usedKB / totalKB) * 100)

    return NextResponse.json({
      totalBytes: totalKB * 1024,
      usedBytes:  usedKB  * 1024,
      freeBytes:  freeKB  * 1024,
      totalStr:   formatBytes(totalKB * 1024),
      usedStr:    formatBytes(usedKB  * 1024),
      freeStr:    formatBytes(freeKB  * 1024),
      pct,
      checkedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
