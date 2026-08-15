import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { THEME_BOOTSTRAP } from '@/lib/theme';

/**
 * Newsreader carries the reading surfaces — passages, headings, anything a
 * learner spends minutes inside. Inter carries interface text, where the
 * priority is legibility at small sizes and tabular figures for the many
 * numbers this product shows.
 */
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Meridian — CELPIP preparation to CLB 12',
    template: '%s · Meridian',
  },
  description:
    'A CELPIP preparation platform that diagnoses what is holding you back, prescribes the highest-value practice, and measures whether it worked.',
  applicationName: 'Meridian',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#14181d' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${newsreader.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Applies the saved theme before the first paint. Without it a dark
          reader gets a white flash on every navigation — precisely the people
          most bothered by one. It reads localStorage, so it cannot be delayed
          by a slow request.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body
        style={
          {
            '--font-display': 'var(--font-newsreader), Georgia, serif',
            '--font-reading': 'var(--font-newsreader), Georgia, serif',
            '--font-body': 'var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif',
          } as React.CSSProperties
        }
      >
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
