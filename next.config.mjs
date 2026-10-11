/** @type {import('next').NextConfig} */
// The site runs as a small Node server (comments, likes and the Studio need one).
export default {
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  devIndicators: false, // hides the round "N" badge shown by `npm run dev` (it never exists in a live build)
};
