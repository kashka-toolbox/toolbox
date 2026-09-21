import {defineRouting} from 'next-intl/routing';
import languages from './languages.json';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: languages.filter((l) => l.enabled).map((l) => l.code),

  // Used when no locale matches
  defaultLocale: 'en'
});