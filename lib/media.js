// Cover photos you upload from your own files. They live on the data disk (data/uploads),
// are checked by their real file signature, and are served through /media/<id>/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), 'data');
export const UPLOAD_DIR = path.join(DATA, 'uploads');
const TYPES = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
const ID = /^[a-f0-9]{24}$/;

/** Identify an image by its first bytes. The file name or the browser's claim is never trusted. */
export function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.toString('ascii', 0, 3) === 'GIF') return 'gif';
  return null;
}

export function saveImage(buf) {
  const ext = sniff(buf);
  if (!ext) throw new Error('Please choose a PNG, JPG, WebP or GIF picture.');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const id = crypto.randomBytes(12).toString('hex');
  fs.writeFileSync(path.join(UPLOAD_DIR, `${id}.${ext}`), buf);
  return id;
}

export function findImage(id) {
  if (typeof id !== 'string' || !ID.test(id)) return null;
  for (const ext of Object.keys(TYPES)) {
    const file = path.join(UPLOAD_DIR, `${id}.${ext}`);
    if (fs.existsSync(file)) return { file, type: TYPES[ext] };
  }
  return null;
}

export function listImages() {
  if (!fs.existsSync(UPLOAD_DIR)) return [];
  return fs.readdirSync(UPLOAD_DIR)
    .map((f) => ({ f, id: f.split('.')[0], t: fs.statSync(path.join(UPLOAD_DIR, f)).mtimeMs }))
    .filter((x) => ID.test(x.id))
    .sort((a, b) => b.t - a.t)
    .map((x) => ({ id: x.id, url: `/media/${x.id}/` }));
}
