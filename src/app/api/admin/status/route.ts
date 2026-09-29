import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { isCloudinaryConfigured } from '@/lib/cloudinary';
import WallpaperModel from '@/models/Wallpaper';
import CategoryModel from '@/models/Category';

export async function GET() {
  try {
    await connectToDatabase();
    const dbConnected = isDatabaseConnected();

    let wallpaperCount = 0;
    let categoryCount = 0;

    if (dbConnected) {
      try {
        wallpaperCount = await WallpaperModel.countDocuments();
        categoryCount = await CategoryModel.countDocuments();
      } catch (err) {
        console.error('Count query error:', err);
      }
    }

    const uri = process.env.MONGODB_URI || '';
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

    return NextResponse.json({
      database: {
        connected: dbConnected,
        configured: Boolean(process.env.MONGODB_URI),
        host: (require('mongoose')).connection.host,
        dbName: (require('mongoose')).connection.name,
        uriMasked: maskedUri,
        wallpaperCount,
        categoryCount,
      },
      cloudinary: {
        configured: isCloudinaryConfigured(),
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'none',
      },
      envLoaded: Boolean(process.env.MONGODB_URI && process.env.CLOUDINARY_API_KEY),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
