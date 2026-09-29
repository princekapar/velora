import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadResult } from '@/types';
export * from './cloudinaryClient';

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sample_secret',
  secure: true,
});

/**
 * Checks if real Cloudinary credentials are configured
 */
export function isCloudinaryConfigured(): boolean {
  const secret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(secret && secret !== 'your_cloudinary_api_secret_here' && secret !== 'sample_secret');
}

/**
 * Server-side upload to Cloudinary with fallback for demo/dev
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string = 'velora/wallpapers'
): Promise<CloudinaryUploadResult> {
  // If real credentials are valid, use Cloudinary API
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: 'image' as const,
        quality: 'auto:best',
        fetch_format: 'auto',
      };

      if (typeof fileBuffer === 'string' && fileBuffer.startsWith('data:')) {
        cloudinary.uploader.upload(fileBuffer, uploadOptions, (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Upload failed'));
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            resource_type: result.resource_type,
          });
        });
      } else {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Upload stream failed'));
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            resource_type: result.resource_type,
          });
        });

        if (Buffer.isBuffer(fileBuffer)) {
          stream.end(fileBuffer);
        } else {
          stream.end(Buffer.from(fileBuffer));
        }
      }
    });
  }

  // Fallback demo upload handler (for zero-setup dev)
  const timestamp = Date.now();
  const mockPublicId = `${folder}/wallpaper_${timestamp}`;
  return {
    secure_url: typeof fileBuffer === 'string' && fileBuffer.startsWith('data:') 
      ? fileBuffer 
      : `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3840&auto=format&fit=crop`,
    public_id: mockPublicId,
    width: 3840,
    height: 2160,
    format: 'webp',
    bytes: 2450000,
    resource_type: 'image',
  };
}

/**
 * Deletes asset from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) return false;
  
  if (isCloudinaryConfigured()) {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (err) {
      console.error('[Cloudinary] Failed to delete public_id:', publicId, err);
      return false;
    }
  }

  console.log(`[Cloudinary Dev/Mock] Deleted asset with public_id: ${publicId}`);
  return true;
}
