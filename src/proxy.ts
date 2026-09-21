import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames.
  // NOTE: must be a static string (Next.js requirement) — keep in sync with
  // the enabled codes in src/i18n/languages.json.
  matcher: ['/', '/(en|de|fr|es|it|pt|nl|pl|sv|da|no|fi|cs|sk|hu|ro|el|tr|uk|ru)/:path*']
};