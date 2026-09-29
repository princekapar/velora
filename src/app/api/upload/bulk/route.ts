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

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for bulk upload' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await uploadToCloudinary(buffer, 'velora/wallpapers/bulk');

        const orientation = determineOrientation(uploadResult.width, uploadResult.height);
        const deviceType = recommendDevice(uploadResult.width, uploadResult.height);
        const resolution = calculateResolution(uploadResult.width, uploadResult.height);
        const aspectRatio = Number((uploadResult.width / uploadResult.height).toFixed(3));

        const suggestedTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

        results.push({
          id: `temp_${Date.now()}_${i}`,
          title: suggestedTitle,
          imageUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          thumbnailUrl: uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          aspectRatio,
          orientation,
          deviceType,
          resolution,
          format: uploadResult.format,
          fileSize: uploadResult.bytes,
          status: 'success',
        });
      } catch (err: any) {
        errors.push({
          fileName: file.name,
          error: err.message || 'Upload failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalReceived: files.length,
      uploadedCount: results.length,
      failedCount: errors.length,
      items: results,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bulk upload failed' }, { status: 500 });
  }
}
