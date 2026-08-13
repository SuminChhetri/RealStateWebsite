import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <header style={{ borderBottom: '1px solid var(--rule)' }}>
        <div className="page" style={{ paddingTop: 'var(--s4)', paddingBottom: 'var(--s4)' }}>
          <Link href="/" style={{ textDecoration: 'none' }} className="row-tight">
            <span className="skill-mark" style={{ background: 'var(--accent)', height: '1em' }} aria-hidden />
            <span className="serif" style={{ fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>
              Meridian
            </span>
          </Link>
        </div>
      </header>
      <main id="main" style={{ display: 'grid', placeItems: 'start center', padding: 'var(--s7) var(--s5) var(--s9)' }}>
        <div style={{ width: '100%', maxWidth: '23rem' }}>{children}</div>
      </main>
    </div>
  );
}
