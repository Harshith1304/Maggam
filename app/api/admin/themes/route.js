import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin, deny } from '@/lib/auth';
import { listThemes, createTheme, updateTheme, removeTheme, isThemeId } from '@/lib/themes';
import { reassignTheme, themeUses } from '@/lib/threads';

const withUses = () => listThemes().map((t) => ({ ...t, uses: themeUses(t.id) }));

export async function GET() {
  if (!(await isAdmin())) return deny();
  return NextResponse.json({ ok: true, themes: withUses() }, { headers: { 'Cache-Control': 'no-store' } });
}

// One endpoint: { action: 'create' | 'update' | 'delete', id?, name?, color?, moveTo? }.
// The four built-in themes are not stored here, so they cannot be touched through it.
export async function POST(request) {
  if (!sameOrigin(request)) return deny(403, 'Cross-site request blocked');
  if (!(await isAdmin())) return deny();
  const p = await request.json().catch(() => null);
  if (!p) return deny(400, 'Bad request');
  try {
    if (p.action === 'create') {
      const theme = createTheme({ name: p.name, color: p.color });
      return NextResponse.json({ ok: true, theme, themes: withUses() });
    }
    if (p.action === 'update') {
      const theme = updateTheme(String(p.id || ''), { name: p.name, color: p.color });
      return NextResponse.json({ ok: true, theme, themes: withUses() });
    }
    if (p.action === 'delete') {
      const id = String(p.id || '');
      if (!isThemeId(id)) return deny(400, 'Only your own themes can be removed.');
      const moved = reassignTheme(id, p.moveTo);
      removeTheme(id);
      return NextResponse.json({ ok: true, moved, themes: withUses() });
    }
    return deny(400, 'Unknown action');
  } catch (e) {
    return deny(400, e.message);
  }
}
