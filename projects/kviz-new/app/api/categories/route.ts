import { NextRequest, NextResponse } from 'next/server'
import { categories } from '@/lib/database'

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const all = categories.getAll()
    return NextResponse.json(all)
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const id = categories.create({
      name: data.name.trim(),
      description: data.description || '',
      color: data.color || '#3b82f6',
      icon: data.icon || '',
    })

    const created = categories.getById(id)
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
    }
    console.error('POST /api/categories error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
