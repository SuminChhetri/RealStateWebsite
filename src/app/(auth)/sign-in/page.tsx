import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AuthForm } from '../AuthForm';
import { signIn } from '../actions';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignInPage() {
  if (await getSession()) redirect('/home');
  return (
    <div className="stack stack-5">
      <div className="stack stack-2">
        <h1 style={{ fontSize: '1.5rem' }}>Welcome back</h1>
        <p className="muted small">Pick up where your profile left off.</p>
      </div>
      <AuthForm mode="sign-in" action={signIn} />
    </div>
  );
}
