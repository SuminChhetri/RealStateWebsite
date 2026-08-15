import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getProfile } from '@/lib/learner/profile';
import { AppNav } from '@/components/AppNav';
import { isReviewerOnlyRole } from '@/lib/practice/review-access';
import { signOut } from '../(auth)/actions';
import './app-shell.css';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/sign-in');

  const profile = await getProfile(session.userId, session.orgId);
  // Onboarding is a learner questionnaire: target level, test date, study
  // budget. A teacher or reviewer invited into an organisation has none of
  // those and did not come here to study — requiring it would lock them out of
  // the one page they came for. They pass through, and /home offers them the
  // questionnaire if they do also want to practise.
  if (!profile.onboarded && !isReviewerOnlyRole(session.role)) redirect('/onboarding');

  return (
    <div className="app-shell">
      <AppNav
        counts={{ reviews: profile.dueReviewCount, mistakes: profile.openMistakes }}
        userName={session.name}
        orgName={session.orgName}
        shared={session.orgKind !== 'personal'}
        signOutAction={signOut}
      />
      <main id="main" className="app-main">
        {children}
      </main>
    </div>
  );
}
