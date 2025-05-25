// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://spade-multi-agent-systems.github.io',
  // base: '/spade', // Commented out for development
  output: 'static',
  build: {
    assets: '_astro',
  },
});
