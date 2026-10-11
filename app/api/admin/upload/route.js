import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin, deny } from '@/lib/auth';
import { saveImage, listImages } from '@/lib/media';

const MAX = 8 * 1024 * 1024;

export async function GET() {
  if (!(await isAdmin())) return deny();
  return NextResponse.json({ ok: true, images: listImages() }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  if (!sameOrigin(request)) return deny(403, 'Cross-site request blocked');
  if (!(await isAdmin())) return deny();
  let file;
  try { file = (await request.formData()).get('file'); } catch { return deny(400, 'Could not read that upload.'); }
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') return deny(400, 'Choose a picture first.');
  if (file.size > MAX) return deny(413, 'That picture is over 8 MB. Try a smaller one.');
  try {
    const id = saveImage(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ok: true, id, url: `/media/${id}/` });
  } catch (e) {
    return deny(400, e.message);
  }
}
