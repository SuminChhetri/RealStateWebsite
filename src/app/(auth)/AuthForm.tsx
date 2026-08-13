'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { AuthState } from './actions';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={pending}>
      {pending ? 'Working…' : label}
    </button>
  );
}

export function AuthForm({
  mode,
  action,
}: {
  mode: 'sign-in' | 'sign-up';
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction] = useActionState(action, {});
  const isSignUp = mode === 'sign-up';

  return (
    <form action={formAction} className="stack stack-4" noValidate>
      {state.error ? (
        <p className="error-text" role="alert">
          {state.error}
        </p>
      ) : null}

      {isSignUp ? (
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            className="input"
            id="name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={!!state.fieldErrors?.name}
            aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
          />
          {state.fieldErrors?.name ? (
            <p className="error-text" id="name-error">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          aria-invalid={!!state.fieldErrors?.email}
          aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
        />
        {state.fieldErrors?.email ? (
          <p className="error-text" id="email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          aria-invalid={!!state.fieldErrors?.password}
          aria-describedby={state.fieldErrors?.password ? 'password-error' : isSignUp ? 'password-hint' : undefined}
        />
        {isSignUp && !state.fieldErrors?.password ? (
          <p className="hint" id="password-hint">
            At least 10 characters, including a number or symbol.
          </p>
        ) : null}
        {state.fieldErrors?.password ? (
          <p className="error-text" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <Submit label={isSignUp ? 'Create account' : 'Sign in'} />

      <p className="small muted center">
        {isSignUp ? (
          <>
            Already have an account? <Link href="/sign-in">Sign in</Link>
          </>
        ) : (
          <>
            New here? <Link href="/sign-up">Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
