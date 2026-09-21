import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    // Keep the service worker out of `next dev`: it serves stale chunks and
    // (with reloadOnOnline) can trigger reload loops during development.
    disable: process.env.NODE_ENV === "development",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    dest: "public",
    fallbacks: {
        document: "/en/offline",
    },
    workboxOptions: {
        disableDevLogs: true,
    },
});

const withNextIntl = createNextIntlPlugin({requestConfig: "./src/i18n/request.ts"});


/** @type {import('next').NextConfig} */
const nextConfig = {
    // needed for containerization
    output: "standalone"
};


export default withPWA(withNextIntl(nextConfig));
