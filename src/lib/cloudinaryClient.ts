/**
 * Client-safe Cloudinary & image URL transformation helpers.
 * Contains pure string operations without any Node.js native dependencies.
 */

export function getOptimizedImageUrl(
  urlOrPublicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'scale';
    quality?: 'auto' | 'auto:good' | 'auto:best' | number;
    format?: 'webp' | 'avif' | 'auto' | 'png';
  }
): string {
  if (!urlOrPublicId) return '';

  // If it's a full Cloudinary URL, inject transformations
  if (urlOrPublicId.includes('res.cloudinary.com')) {
    const parts = urlOrPublicId.split('/upload/');
    if (parts.length === 2) {
      const transforms: string[] = [];
      if (options?.width) transforms.push(`w_${options.width}`);
      if (options?.height) transforms.push(`h_${options.height}`);
      if (options?.crop) transforms.push(`c_${options.crop}`);
      transforms.push(`q_${options?.quality || 'auto'}`);
      transforms.push(`f_${options?.format || 'auto'}`);

      return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
    }
  }

  // If it's an Unsplash URL (used in initial seeds), return parameterized URL
  if (urlOrPublicId.includes('images.unsplash.com')) {
    try {
      const url = new URL(urlOrPublicId);
      if (options?.width) url.searchParams.set('w', options.width.toString());
      if (options?.height) url.searchParams.set('h', options.height.toString());
      if (options?.format === 'png') {
        url.searchParams.delete('auto');
        url.searchParams.set('fm', 'png');
      } else {
        url.searchParams.set('auto', 'format');
      }
      url.searchParams.set('fit', options?.crop === 'fill' ? 'crop' : 'max');
      url.searchParams.set('q', '90');
      return url.toString();
    } catch (e) {
      return urlOrPublicId;
    }
  }

  return urlOrPublicId;
}

export function getThumbnailUrl(url: string, width: number = 720): string {
  return getOptimizedImageUrl(url, { width, quality: 'auto:good', format: 'webp' });
}

export function getPreviewUrl(url: string, width: number = 1920): string {
  return getOptimizedImageUrl(url, { width, quality: 'auto:best', format: 'auto' });
}

export function getDownloadUrl(
  url: string,
  preset: 'original' | 'iphone' | 'android' | 'desktop-4k' | 'desktop-2k' | 'desktop-fhd'
): string {
  switch (preset) {
    case 'iphone':
      return getOptimizedImageUrl(url, { width: 1170, height: 2532, crop: 'fill', format: 'png' });
    case 'android':
      return getOptimizedImageUrl(url, { width: 1080, height: 2400, crop: 'fill', format: 'png' });
    case 'desktop-4k':
      return getOptimizedImageUrl(url, { width: 3840, height: 2160, crop: 'fill', format: 'png' });
    case 'desktop-2k':
      return getOptimizedImageUrl(url, { width: 2560, height: 1440, crop: 'fill', format: 'png' });
    case 'desktop-fhd':
      return getOptimizedImageUrl(url, { width: 1920, height: 1080, crop: 'fill', format: 'png' });
    case 'original':
    default:
      return getOptimizedImageUrl(url, { format: 'png' });
  }
}
