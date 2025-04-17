import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const rightFolder = path.join(process.cwd(), 'public', '3D', 'right');
  try {
    const files = await fs.readdir(rightFolder);
    const imageFiles = files
      .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
      .map((file) => `/3D/right/${file}`);
    return new Response(JSON.stringify(imageFiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read right folder' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}