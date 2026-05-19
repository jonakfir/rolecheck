import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/auth/'],
      },
    ],
    sitemap: 'https://rolecheck.io/sitemap.xml',
    host: 'https://rolecheck.io',
  };
}
