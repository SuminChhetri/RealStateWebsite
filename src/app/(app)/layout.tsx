import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getProfile } from '@/lib/learner/profile';
import { AppNav } from '@/components/AppNav';
import { signOut } from '../(auth)/actions';
import './app-shell.css';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/sign-in');

  const profile = await getProfile(session.userId, session.orgId);
  if (!profile.onboarded) redirect('/onboarding');

  return (
    <div className="app-shell">
      <AppNav
        counts={{ reviews: profile.dueReviewCount, mistakes: profile.openMistakes }}
        userName={session.name}
        orgName={session.orgName}
        signOutAction={signOut}
      />
      <main id="main" className="app-main">
        {children}
      </main>
    </div>
  );
}
