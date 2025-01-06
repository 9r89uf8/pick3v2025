import nextPWA from 'next-pwa';

const withPWA = nextPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode
    register: true,
    skipWaiting: true,
});

const nextConfig = {
    experimental: {
        appDir: true,
    },
    reactStrictMode: true,
};

export default withPWA(nextConfig);
