import { NextRequest, NextResponse } from 'next/server';
import { getWallpaperById, getWallpaperBySlug, updateWallpaper, deleteWallpaper } from '@/services/wallpaperService';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let wallpaper = await getWallpaperById(id);
    if (!wallpaper) {
      wallpaper = await getWallpaperBySlug(id);
    }

    if (!wallpaper) {
      return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 });
    }

    return NextResponse.json(wallpaper);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching wallpaper' }, { status: 500 });
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

    const updated = await updateWallpaper(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, wallpaper: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating wallpaper' }, { status: 500 });
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
    const result = await deleteWallpaper(id);

    if (!result.success) {
      return NextResponse.json({ error: 'Wallpaper not found or deletion failed' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Wallpaper and Cloudinary asset deleted successfully',
      cloudinaryDeleted: result.cloudinaryDeleted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting wallpaper' }, { status: 500 });
  }
}
