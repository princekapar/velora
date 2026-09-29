import { NextRequest, NextResponse } from 'next/server';
import { incrementStats } from '@/services/wallpaperService';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await incrementStats(id, 'views');
    return NextResponse.json({ success: true, message: 'View counted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
