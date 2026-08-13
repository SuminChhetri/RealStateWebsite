import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AuthForm } from '../AuthForm';
import { signUp } from '../actions';

export const metadata: Metadata = { title: 'Create your account' };

export default async function SignUpPage() {
  if (await getSession()) redirect('/home');
  return (
    <div className="stack stack-5">
      <div className="stack stack-2">
        <h1 style={{ fontSize: '1.5rem' }}>Create your account</h1>
        <p className="muted small">
          Next: three questions about your goal, then a diagnostic that tells you where you actually stand.
        </p>
      </div>
      <AuthForm mode="sign-up" action={signUp} />
      <p className="tiny faint">
        Meridian stores your practice history to build your profile. It is not affiliated with, endorsed by, or
        connected to the organisations that produce or administer the CELPIP test.
      </p>
    </div>
  );
}
