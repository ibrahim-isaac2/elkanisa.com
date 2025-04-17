import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, context: any) {
  // استخدام any مؤقتًا عشان نعدّي خطأ الـ TypeScript
  const { params } = context;
  const { category } = params;

  const folderPath = path.join(process.cwd(), 'public', 'orzozox', category);

  try {
    await fs.access(folderPath); // Check if the folder exists
    const items = await fs.readdir(folderPath, { withFileTypes: true });

    const result = await Promise.all(
      items.map(async (item) => {
        if (item.isDirectory()) {
          return { name: item.name, type: 'folder' };
        } else if (/\.(jpg|jpeg|png)$/i.test(item.name)) {
          return { name: item.name, type: 'image' };
        }
        return null; // Ignore other file types
      })
    );

    // Filter out null items
    const filteredResult = result.filter((item) => item !== null);

    // Separate folders and images
    const folders = filteredResult.filter((item) => item.type === 'folder');
    const images = filteredResult.filter((item) => item.type === 'image');

    // Sort images by the numeric part of their name (e.g., Slide1.JPG, Slide2.JPG, ...)
    images.sort((a, b) => {
      // Extract the number from the file name (e.g., "1" from "Slide1.JPG")
      const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

    // Combine folders and sorted images (folders first, then images)
    const sortedResult = [...folders, ...images];

    return NextResponse.json(sortedResult, { status: 200 });
  } catch (error) {
    console.error('Error reading folder:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array if folder doesn't exist
  }
}