import { MetadataRoute } from 'next';
import { getWallpapers } from '@/services/wallpaperService';
import { getCategories } from '@/services/categoryService';
import { getCollections } from '@/services/collectionService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const [wallpapersRes, categories, collections] = await Promise.all([
    getWallpapers({ limit: 100 }),
    getCategories(),
    getCollections(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/wallpapers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wallpapers/phone`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wallpapers/desktop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wallpapers/4k`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const wallpaperRoutes: MetadataRoute.Sitemap = wallpapersRes.wallpapers.map((w) => ({
    url: `${baseUrl}/wallpaper/${w.slug}`,
    lastModified: new Date(w.updatedAt || w.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(c.createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((col) => ({
    url: `${baseUrl}/collection/${col.slug}`,
    lastModified: new Date(col.createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...wallpaperRoutes, ...categoryRoutes, ...collectionRoutes];
}
