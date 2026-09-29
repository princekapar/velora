import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/services/categoryService';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name || !body.coverImage) {
      return NextResponse.json({ error: 'Name and Cover Image are required' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await createCategory({
      name: body.name,
      slug,
      description: body.description || '',
      coverImage: body.coverImage,
      featured: Boolean(body.featured),
      order: Number(body.order) || 0,
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
