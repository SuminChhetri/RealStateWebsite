'use client';

import { useEffect, useState, useTransition } from 'react';
import { THEMES, THEME_STORAGE_KEY, type ThemeKey } from '@/lib/theme';

/**
 * The theme picker.
 *
 * Two things happen when a theme is chosen, and they are deliberately separate:
 *
 *  1. The document attribute changes immediately and localStorage is written,
 *     so the change is instant and survives the next page load before any
 *     request completes. A setting that takes a round trip to appear feels
 *     broken however fast the round trip is.
 *  2. The choice is saved to the profile in the background, so it follows the
 *     account to another device. Someone who needs high contrast needs it
 *     everywhere.
 *
 * Each option previews itself: the swatch is rendered with that theme's own
 * tokens, so the list shows what it is offering rather than describing it.
 */
export function ThemePicker({
  current,
  saveAction,
}: {
  current: ThemeKey;
  saveAction: (theme: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<ThemeKey>(current);
  const [pending, startTransition] = useTransition();

  // The server is the source of truth on first render; reconcile the browser to
  // it, so signing in on a new device applies the saved theme rather than
  // whatever that browser happened to have.
  useEffect(() => {
    apply(current);
  }, [current]);

  function apply(theme: ThemeKey) {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* private browsing; the profile copy still works */
    }
  }

  function choose(theme: ThemeKey) {
    setSelected(theme);
    apply(theme);
    startTransition(async () => {
      await saveAction(theme);
    });
  }

  return (
    <div className="stack stack-3">
      <ul className="theme-grid" role="radiogroup" aria-label="Theme">
        {THEMES.map((theme) => {
          const active = selected === theme.key;
          return (
            <li key={theme.key}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                className="theme-option"
                onClick={() => choose(theme.key)}
              >
                <span className="theme-swatch" data-preview={theme.key} aria-hidden>
                  <span className="theme-swatch-bar" />
                  <span className="theme-swatch-bar theme-swatch-bar-short" />
                  <span className="theme-swatch-dot" />
                </span>
                <span className="stack stack-1" style={{ minWidth: 0 }}>
                  <span className="small" style={{ fontWeight: 500 }}>
                    {theme.name}
                    {active ? <span className="visually-hidden"> (selected)</span> : null}
                  </span>
                  <span className="tiny faint">{theme.description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="tiny faint" aria-live="polite">
        {pending ? 'Saving…' : 'Saved to your account, so it follows you to another device.'}
      </p>
    </div>
  );
}
