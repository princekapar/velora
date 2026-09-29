export type OrientationType = 'portrait' | 'landscape' | 'square';
export type DeviceType = 'phone' | 'desktop' | 'both';
export type ResolutionType = 'HD' | '2K' | '4K' | '5K' | '8K';
export type WallpaperStatus = 'published' | 'draft';

export interface Wallpaper {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: OrientationType;
  deviceType: DeviceType;
  resolution: string;
  format: string;
  fileSize: number;
  category: string; // Category Name or Category ID
  tags: string[];
  featured: boolean;
  status: WallpaperStatus;
  downloads: number;
  views: number;
  collectionSlug?: string;
  colorPalette?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  wallpaperCount: number;
  featured: boolean;
  order: number;
  createdAt: string;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  wallpaperCount: number;
  wallpapers?: Wallpaper[];
  featured: boolean;
  status: 'published' | 'draft';
  order: number;
  createdAt: string;
}

export interface Tag {
  _id?: string;
  name: string;
  slug: string;
  count: number;
}

export interface FilterState {
  device: 'all' | 'phone' | 'desktop';
  resolution: string;
  orientation: 'all' | 'portrait' | 'landscape';
  category: string;
  sort: 'newest' | 'popular' | 'featured' | 'downloads';
  search: string;
}

export interface AdminStats {
  totalWallpapers: number;
  phoneWallpapers: number;
  desktopWallpapers: number;
  fourKWallpapers: number;
  totalDownloads: number;
  totalViews: number;
  categoriesCount: number;
  collectionsCount: number;
  recentUploads: Wallpaper[];
  popularCategories: { name: string; count: number; downloads: number }[];
  downloadTrends: { day: string; downloads: number; views: number }[];
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
}
