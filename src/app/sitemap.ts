import type { MetadataRoute } from 'next';

// Static sitemap for marketing routes. Programmatic routes (city pages, code
// pages, etc.) should be added by extending this list inside generateSitemap()
// or by calling Next's dynamic sitemap APIs.

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rolecheck.io';
  const now = new Date();
  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
  ];
}
