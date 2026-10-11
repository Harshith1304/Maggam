// Comments and likes live in one small JSON file (data/comments.json).
// Writes are queued so two visitors can never overwrite each other, and replaced atomically.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), 'data');
const FILE = path.join(DIR, 'comments.json');
let queue = Promise.resolve();

async function read() {
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')); } catch { return { comments: [] }; }
}
async function write(db) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 1), 'utf8');
  await fs.rename(tmp, FILE);
}
function mutate(fn) {
  const run = queue.then(async () => {
    const db = await read();
    const out = await fn(db);
    await write(db);
    return out;
  });
  queue = run.catch(() => {});
  return run;
}
async function snapshot() {
  await queue.catch(() => {});
  return read();
}

const view = (c, vid) => ({
  id: c.id, parentId: c.parentId, replyTo: c.replyTo, name: c.name, message: c.message,
  createdAt: c.createdAt, author: !!c.author, likes: c.likes.length, liked: !!vid && c.likes.includes(vid),
});

export async function listForThread(slug, vid) {
  const db = await snapshot();
  return db.comments.filter((c) => c.slug === slug).map((c) => view(c, vid));
}

export function addComment({ slug, name, message, parentId, vid, author }) {
  return mutate((db) => {
    let root = null, replyTo = null;
    if (parentId) {
      const parent = db.comments.find((c) => c.id === parentId && c.slug === slug);
      if (!parent) throw new Error('The comment you replied to is gone.');
      root = parent.parentId || parent.id; // replies stay one level deep
      replyTo = parent.name;
    }
    const c = { id: crypto.randomUUID(), slug, parentId: root, replyTo, name, message, createdAt: new Date().toISOString(), author: !!author, read: !!author, likes: [] };
    db.comments.push(c);
    return view(c, vid);
  });
}

export function toggleLike(id, vid) {
  return mutate((db) => {
    const c = db.comments.find((x) => x.id === id);
    if (!c) throw new Error('That comment is gone.');
    const i = c.likes.indexOf(vid);
    if (i >= 0) c.likes.splice(i, 1); else c.likes.push(vid);
    return { liked: i < 0, likes: c.likes.length };
  });
}

export function deleteComment(id) {
  return mutate((db) => {
    const before = db.comments.length;
    db.comments = db.comments.filter((c) => c.id !== id && c.parentId !== id);
    return before - db.comments.length;
  });
}

export function markRead(ids) {
  return mutate((db) => {
    let n = 0;
    for (const c of db.comments) if (!c.read && (ids === 'all' || ids.includes(c.id))) { c.read = true; n++; }
    return n;
  });
}

export async function everything() {
  const db = await snapshot();
  return db.comments.map((c) => ({ ...view(c, null), slug: c.slug, read: !!c.read }));
}

export async function unreadCount() {
  const db = await snapshot();
  return db.comments.filter((c) => !c.read && !c.author).length;
}
