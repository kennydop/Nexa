/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Product name: keep in sync with src/lib/brand.ts and index.html.
const APP_NAME = 'Nexa'
const THEME_COLOR = '#1A0E16'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon-180.png'],
      manifest: {
        id: '/',
        name: `${APP_NAME} · UCC Learning`,
        short_name: APP_NAME,
        description:
          'Every UCC programme, course, learning material and past question in one place, with course discussions.',
        lang: 'en-GH',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: THEME_COLOR,
        theme_color: THEME_COLOR,
        categories: ['education'],
        icons: [
          { src: '/icons/pwa-64.png', sizes: '64x64', type: 'image/png' },
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Search courses', url: '/search', icons: [{ src: '/icons/pwa-192.png', sizes: '192x192' }] },
          { name: 'Saved', url: '/saved', icons: [{ src: '/icons/pwa-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The PDF worker (~1 MB) and demo files load on demand instead of in the install precache.
        globIgnores: ['**/pdf.worker*', '**/PdfView-*', 'demo/**'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Uploaded materials and past questions: read offline once opened.
            urlPattern: ({ url }) => url.pathname.includes('/storage/v1/object/public/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'course-files',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
              // Only full responses: opaque or partial (video range) responses are never cached.
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // PDF viewer worker and demo-mode sample files.
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && (/\/(pdf\.worker|PdfView-)[^/]*$/.test(url.pathname) || /^\/demo\/.+\.(pdf|webp|jpg)$/.test(url.pathname)),
            handler: 'CacheFirst',
            options: {
              cacheName: 'viewer-assets',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Catalogue reads: fresh when online, last copy when offline.
            urlPattern: ({ url, request }) => url.pathname.startsWith('/rest/v1/') && request.method === 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'catalog-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ["e2e/**", "node_modules/**"],
  },
})
