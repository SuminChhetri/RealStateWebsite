/**
 * Themes.
 *
 * This is a product where people read long passages under time pressure, often
 * late at night, sometimes for an hour without looking away. That makes the
 * theme a reading-comfort setting rather than a decoration, and it is why the
 * list below is short and each entry has a reason to exist.
 *
 * The palette swap is done entirely with the tokens already defined in
 * `globals.css`. No component knows which theme is active, so adding one is a
 * block of custom properties and nothing else.
 */

export const THEMES = [
  {
    key: 'system',
    name: 'System',
    description: 'Follow the light or dark setting of your device.',
  },
  {
    key: 'light',
    name: 'Paper',
    description: 'Warm off-white, the default. Easiest for long daytime reading.',
  },
  {
    key: 'dark',
    name: 'Ink',
    description: 'Dark blue-grey with warm text. For evening work.',
  },
  {
    key: 'sepia',
    name: 'Sepia',
    description: 'Low-contrast warm paper. Gentler than white over a long sitting.',
  },
  {
    key: 'nocturne',
    name: 'Nocturne',
    description: 'Very dark and low in blue, for reading in an unlit room.',
  },
  {
    key: 'contrast',
    name: 'High contrast',
    description: 'Maximum separation of text from background, and heavier rules.',
  },
] as const;

export type ThemeKey = (typeof THEMES)[number]['key'];

export const DEFAULT_THEME: ThemeKey = 'system';

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === 'string' && THEMES.some((theme) => theme.key === value);
}

export const THEME_STORAGE_KEY = 'meridian-theme';

/**
 * Applied before first paint, inlined into the document head.
 *
 * Without this the page renders in the default palette and then corrects
 * itself, which is a white flash for anyone using a dark theme — the exact
 * people most bothered by one. It reads localStorage rather than waiting for
 * the server, so it costs nothing and cannot be blocked by a slow request.
 *
 * Written as a string because it has to run before React does.
 */
export const THEME_BOOTSTRAP = `(function(){try{
var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
if(t&&t!=='system'){document.documentElement.setAttribute('data-theme',t);}
}catch(e){}})();`;
