'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/* When "Maggam" in the header is pressed on another page, land on the very top of the home page. */
export default function ScrollTopOnHome() {
  const path = usePathname();
  useEffect(() => {
    if (path === '/' && window.__maggamTop) {
      window.__maggamTop = false;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [path]);
  return null;
}
