import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://Melkocore.github.io',
  base: '/membrillo-podcast',
  server: {
    port: 4322,
  },
  preview: {
    port: 4322,
  },
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      global: 'globalThis',
    },
  },
});
