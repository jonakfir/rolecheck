import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rolecheck — Score, Fix & Rewrite Your Job Descriptions',
  description: 'Rolecheck scores, flags, and rewrites your job descriptions to attract better, more diverse applicants. Powered by Claude AI.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Rolecheck — Score, Fix & Rewrite Your Job Descriptions',
    description: 'Your job description is why you\'re not finding great candidates. Rolecheck fixes that.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
