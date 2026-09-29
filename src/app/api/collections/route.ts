import { NextRequest, NextResponse } from 'next/server';
import { getCollections, createCollection } from '@/services/collectionService';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get('all') === 'true';
    const collections = await getCollections(includeDrafts);
    return NextResponse.json(collections);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch collections' }, { status: 500 });
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

    const collection = await createCollection({
      name: body.name,
      slug,
      description: body.description || '',
      coverImage: body.coverImage,
      featured: Boolean(body.featured),
      status: body.status || 'published',
      order: Number(body.order) || 0,
    });

    return NextResponse.json({ success: true, collection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create collection' }, { status: 500 });
  }
}
