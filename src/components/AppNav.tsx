'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * Navigation is organised by what a learner is trying to do, not by content
 * type: today's work, the skills, the record of what they got wrong, and the
 * long view. Everything else lives one level down.
 */
const GROUPS: {
  label: string;
  items: { href: string; label: string; badge?: 'reviews' | 'mistakes'; skill?: string }[];
}[] = [
  {
    label: 'Today',
    items: [
      { href: '/home', label: 'Today' },
      { href: '/review', label: 'Review', badge: 'reviews' },
      { href: '/plan', label: 'Study plan' },
    ],
  },
  {
    label: 'Practice',
    items: [
      // The four skills carry their colour here as well, so the mark beside a
      // heading anywhere in the app means the same thing as the mark in the nav.
      { href: '/practice/reading', label: 'Reading', skill: 'reading' },
      { href: '/practice/listening', label: 'Listening', skill: 'listening' },
      { href: '/writing', label: 'Writing', skill: 'writing' },
      { href: '/speaking', label: 'Speaking', skill: 'speaking' },
      { href: '/mock-tests', label: 'Mock tests' },
    ],
  },
  {
    label: 'Build',
    items: [
      { href: '/library', label: 'Lessons' },
      { href: '/vocabulary', label: 'Vocabulary' },
      { href: '/grammar', label: 'Grammar' },
    ],
  },
  {
    label: 'Your record',
    items: [
      { href: '/mistakes', label: 'Mistakes', badge: 'mistakes' },
      { href: '/progress', label: 'Progress' },
      { href: '/compare', label: 'Compare sittings' },
      { href: '/report', label: 'Readiness report' },
      { href: '/path', label: 'CLB path' },
    ],
  },
];

const MOBILE_ITEMS = [
  { href: '/home', label: 'Today' },
  { href: '/practice/reading', label: 'Practice' },
  { href: '/review', label: 'Review' },
  { href: '/mistakes', label: 'Mistakes' },
  { href: '/progress', label: 'Progress' },
];

export function AppNav({
  counts,
  userName,
  orgName,
  signOutAction,
}: {
  counts: { reviews: number; mistakes: number };
  userName: string;
  orgName: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/home' && pathname.startsWith(href));

  return (
    <>
      <nav className="app-nav no-print" aria-label="Main">
        <div className="app-nav-brand">
          <Link href="/home" className="row-tight" style={{ textDecoration: 'none' }}>
            <span className="skill-mark" style={{ background: 'var(--accent)', height: '1em' }} aria-hidden />
            <span className="serif" style={{ fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>
              Meridian
            </span>
          </Link>
        </div>

        <div className="app-nav-groups">
          {GROUPS.map((group) => (
            <div key={group.label} className="app-nav-group">
              <p className="eyebrow">{group.label}</p>
              <ul>
                {group.items.map((item) => {
                  const count = item.badge === 'reviews' ? counts.reviews : item.badge === 'mistakes' ? counts.mistakes : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                        className="app-nav-link"
                        data-skill={item.skill}
                      >
                        <span className="app-nav-label">
                          {item.skill ? <span className="app-nav-dot" aria-hidden /> : null}
                          {item.label}
                        </span>
                        {item.badge && count > 0 ? <span className="app-nav-count numeric">{count}</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="app-nav-foot">
          <button
            type="button"
            className="app-nav-user"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            <span className="app-nav-avatar" aria-hidden>
              {userName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? '')
                .join('') || '·'}
            </span>
            <span className="stack" style={{ alignItems: 'flex-start', minWidth: 0 }}>
              <span className="small" style={{ fontWeight: 500 }}>
                {userName}
              </span>
              <span className="tiny faint" style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '9rem' }}>
                {orgName}
              </span>
            </span>
            <span className="app-nav-caret" aria-hidden>
              {menuOpen ? '▴' : '▾'}
            </span>
          </button>
          {menuOpen ? (
            <div className="app-nav-menu">
              <Link href="/profile" className="app-nav-link">
                Profile
              </Link>
              <Link href="/plans" className="app-nav-link">
                Plans
              </Link>
              <Link href="/cohort" className="app-nav-link">
                Cohort
              </Link>
              <Link href="/settings" className="app-nav-link">
                Settings
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="app-nav-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </nav>

      <nav className="app-tabbar no-print" aria-label="Main">
        {MOBILE_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
            {item.label}
            {item.href === '/review' && counts.reviews > 0 ? (
              <span className="app-tabbar-dot" aria-label={`${counts.reviews} due`} />
            ) : null}
          </Link>
        ))}
      </nav>
    </>
  );
}
