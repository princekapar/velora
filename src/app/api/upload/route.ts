import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAdminSession } from '@/lib/auth';

function calculateResolution(width: number, height: number): string {
  const maxDim = Math.max(width, height);
  if (maxDim >= 7000) return '8K';
  if (maxDim >= 4500) return '5K';
  if (maxDim >= 3400) return '4K';
  if (maxDim >= 2200) return '2K';
  return 'HD';
}

function determineOrientation(width: number, height: number): 'portrait' | 'landscape' | 'square' {
  const ratio = width / height;
  if (ratio > 1.1) return 'landscape';
  if (ratio < 0.9) return 'portrait';
  return 'square';
}

function recommendDevice(width: number, height: number): 'phone' | 'desktop' | 'both' {
  const ratio = width / height;
  if (ratio <= 0.6) return 'phone';
  if (ratio >= 1.5) return 'desktop';
  return 'both';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    let buffer: Buffer;
    let originalName = 'wallpaper';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }

      originalName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }
      originalName = body.name || 'wallpaper';
      const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    }

    const folder = 'velora/wallpapers';
    const uploadResult = await uploadToCloudinary(buffer, folder);

    const orientation = determineOrientation(uploadResult.width, uploadResult.height);
    const recommendedDevice = recommendDevice(uploadResult.width, uploadResult.height);
    const resolution = calculateResolution(uploadResult.width, uploadResult.height);
    const aspectRatio = Number((uploadResult.width / uploadResult.height).toFixed(3));

    // Suggested clean title from original filename
    const suggestedTitle = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        thumbnailUrl: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        aspectRatio,
        orientation,
        deviceType: recommendedDevice,
        resolution,
        format: uploadResult.format,
        fileSize: uploadResult.bytes,
        suggestedTitle,
      },
    });
  } catch (error: any) {
    console.error('[Upload Route] Error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
