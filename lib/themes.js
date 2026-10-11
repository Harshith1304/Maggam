// Your own themes (dyes). The four built-in ones live in lib/dyes.js and can never be changed here.
// Custom themes are kept in data/themes.json next to the comments.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { CATEGORIES } from './dyes';

const DATA = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), 'data');
const FILE = path.join(DATA, 'themes.json');
export const MAX_THEMES = 20;
export const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = /^t[a-f0-9]{10}$/;
const NAME = /^[\p{L}\p{N} &'’.\-]{1,24}$/u;

let memo = null;
function read() {
  try {
    const st = fs.statSync(FILE);
    const key = `${st.mtimeMs}:${st.size}`;
    if (memo && memo.key === key) return memo.list;
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const list = (raw.themes || []).filter((t) => ID.test(t.id) && HEX.test(t.color) && t.name);
    memo = { key, list };
    return list;
  } catch {
    return [];
  }
}
function write(list) {
  fs.mkdirSync(DATA, { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ themes: list }, null, 1), 'utf8');
  fs.renameSync(tmp, FILE);
  memo = null;
}

export const listThemes = () => read().map((t) => ({ ...t }));
export const getTheme = (id) => read().find((t) => t.id === id) || null;
export const isThemeId = (id) => typeof id === 'string' && ID.test(id);

function check({ name, color }, selfId) {
  name = String(name ?? '').replace(/\s+/g, ' ').trim();
  if (!name) throw new Error('Give the theme a name.');
  if (!NAME.test(name)) throw new Error('Use letters, numbers, spaces and & - . \' only (up to 24 characters).');
  if (!HEX.test(String(color ?? ''))) throw new Error('Pick a colour for the theme.');
  const lower = name.toLowerCase();
  if (CATEGORIES.some((c) => c.name.toLowerCase() === lower)) throw new Error(`"${name}" is one of the built-in themes. Choose another name.`);
  if (read().some((t) => t.id !== selfId && t.name.toLowerCase() === lower)) throw new Error(`You already have a theme called "${name}".`);
  return { name, color: String(color).toLowerCase() };
}

export function createTheme(input, forceId) {
  const list = read().slice();
  if (list.length >= MAX_THEMES) throw new Error(`You can keep up to ${MAX_THEMES} custom themes. Remove one first.`);
  const ok = check(input);
  const t = { id: forceId && isThemeId(forceId) ? forceId : 't' + crypto.randomBytes(5).toString('hex'), ...ok, createdAt: new Date().toISOString() };
  list.push(t);
  write(list);
  return t;
}

export function updateTheme(id, input) {
  if (!isThemeId(id)) throw new Error('Unknown theme.');
  const list = read().slice();
  const i = list.findIndex((t) => t.id === id);
  if (i < 0) throw new Error('That theme no longer exists.');
  list[i] = { ...list[i], ...check(input, id) };
  write(list);
  return list[i];
}

export function removeTheme(id) {
  if (!isThemeId(id)) throw new Error('Unknown theme.');
  const list = read();
  if (!list.some((t) => t.id === id)) throw new Error('That theme no longer exists.');
  write(list.filter((t) => t.id !== id));
}

/** If a thread remembers a theme that is missing from the store (for example the data folder was not copied), bring it back. */
export function restoreTheme({ id, name, color }) {
  if (!isThemeId(id) || getTheme(id) || !HEX.test(color || '')) return;
  try { createTheme({ name, color }, id); } catch { /* name already taken: the thread keeps its remembered colour */ }
}
