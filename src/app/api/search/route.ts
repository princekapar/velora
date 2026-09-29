import { NextRequest, NextResponse } from 'next/server';
import { getWallpapers } from '@/services/wallpaperService';
import { getCategories } from '@/services/categoryService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      const popular = await getWallpapers({ sort: 'popular', limit: 8 });
      const categories = await getCategories();
      return NextResponse.json({
        wallpapers: popular.wallpapers,
        suggestions: ['Minimal', 'Dolomites', 'Tokyo', 'AMOLED', 'Cyberpunk', 'Space', '4K', 'Architecture'],
        categories,
      });
    }

    const [results, categories] = await Promise.all([
      getWallpapers({ search: q, limit: 20 }),
      getCategories(),
    ]);

    const matchingCategories = categories.filter((c) =>
      c.name.toLowerCase().includes(q.toLowerCase())
    );

    // Extract relevant tags
    const matchedTags = new Set<string>();
    results.wallpapers.forEach((w) => {
      w.tags?.forEach((t) => {
        if (t.toLowerCase().includes(q.toLowerCase())) {
          matchedTags.add(t);
        }
      });
    });

    return NextResponse.json({
      wallpapers: results.wallpapers,
      total: results.total,
      categories: matchingCategories,
      tags: Array.from(matchedTags).slice(0, 8),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
