import fs from 'node:fs';
import { findImage } from '@/lib/media';

export async function GET(request, { params }) {
  const { id } = await params;
  const img = findImage(id);
  if (!img) return new Response('Not found', { status: 404 });
  return new Response(fs.readFileSync(img.file), {
    headers: { 'Content-Type': img.type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
  });
}
