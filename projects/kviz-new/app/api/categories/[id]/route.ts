import { NextRequest, NextResponse } from 'next/server'
import { categories } from '@/lib/database'

// GET /api/categories/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = categories.getById(id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PUT /api/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const existing = categories.getById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    categories.update(id, {
      name: data.name.trim(),
      description: data.description || '',
      color: data.color || '#3b82f6',
      icon: data.icon || '',
    })

    return NextResponse.json(categories.getById(id))
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
    }
    console.error('PUT /api/categories/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = categories.getById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    categories.delete(id)
    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    if (error?.message?.includes('cannot be deleted')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('DELETE /api/categories/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
