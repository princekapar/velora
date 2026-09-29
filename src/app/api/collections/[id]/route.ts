import { NextRequest, NextResponse } from 'next/server';
import { getCollectionBySlug, updateCollection, deleteCollection } from '@/services/collectionService';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const collection = await getCollectionBySlug(id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json(collection);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateCollection(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, collection: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const success = await deleteCollection(id);

    return NextResponse.json({ success, message: 'Collection deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete collection' }, { status: 500 });
  }
}
