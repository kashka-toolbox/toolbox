"use client";

import { NextIntlClientProvider, useMessages } from "next-intl";

const warningsShown: string[] = [];

/**
 * Handles client side internationalization with error handling.
 */
export default function IntlErrorHandlingProvider(
    { children, locale }: { children: React.ReactNode; locale: string },
) {
    const messages = useMessages();

    return (
        <NextIntlClientProvider
            locale={locale}
            onError={(error) => {
                if (error.code != "MISSING_MESSAGE") {
                    console.error(error);
                }
            }}
            getMessageFallback={({ namespace, key }) => {
                const path = [namespace, key].filter((part) => part != null)
                    .join(".");

                if (!warningsShown.includes(path + locale)) {
                    console.warn(
                        `Missing translation for "${path}" in locale "${locale}".`,
                    );
                    warningsShown.push(path + locale);
                }

                return messages[key] ?? `[${key}]`;
            }}
            messages={messages}
        >
            {children}
        </NextIntlClientProvider>
    );
}
