import { getRequestConfig } from "next-intl/server";
import { hasLocale, IntlErrorCode } from "next-intl";
import { routing } from "./routing";

/**
 * Handles server side internationalization with error handling.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../i18n/${locale}.json`)).default,
    onError(error) {
      if (error.code === "MISSING_MESSAGE") {
        console.warn("Missing translation", error.message);
        return;
      }
      throw error;
    },
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join(".");

      if (error.code === "MISSING_MESSAGE") {
        console.warn(
          `Missing translation for "${path}" in locale "${locale}".`,
        );
        return `[${key}]`;
      }

      return "[error]";
    },
  };
});
