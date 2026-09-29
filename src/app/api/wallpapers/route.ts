import { NextRequest, NextResponse } from 'next/server';
import { getWallpapers, createWallpaper } from '@/services/wallpaperService';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters = {
      device: (searchParams.get('device') || 'all') as any,
      resolution: searchParams.get('resolution') || 'all',
      orientation: (searchParams.get('orientation') || 'all') as any,
      category: searchParams.get('category') || 'all',
      sort: (searchParams.get('sort') || 'newest') as any,
      search: searchParams.get('search') || '',
      status: (searchParams.get('status') || 'published') as any,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '24', 10),
    };

    const data = await getWallpapers(filters);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch wallpapers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title || !body.imageUrl || !body.category) {
      return NextResponse.json({ error: 'Title, Image URL, and Category are required' }, { status: 400 });
    }

    const created = await createWallpaper({
      title: body.title,
      slug: body.slug,
      description: body.description || '',
      imageUrl: body.imageUrl,
      cloudinaryPublicId: body.cloudinaryPublicId || 'velora/uploads/' + Date.now(),
      thumbnailUrl: body.thumbnailUrl || body.imageUrl,
      width: Number(body.width) || 3840,
      height: Number(body.height) || 2160,
      aspectRatio: Number(body.aspectRatio) || (Number(body.width) && Number(body.height) ? Number(body.width) / Number(body.height) : 1.777),
      orientation: body.orientation || 'landscape',
      deviceType: body.deviceType || 'desktop',
      resolution: body.resolution || '4K',
      format: body.format || 'webp',
      fileSize: Number(body.fileSize) || 0,
      category: body.category,
      tags: Array.isArray(body.tags) ? body.tags : typeof body.tags === 'string' ? body.tags.split(',').map((t: string) => t.trim()) : [],
      featured: Boolean(body.featured),
      status: body.status || 'published',
      collectionSlug: body.collectionSlug,
      colorPalette: body.colorPalette || [],
    });

    return NextResponse.json({ success: true, wallpaper: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create wallpaper' }, { status: 500 });
  }
}
