import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  outDir: './dist',
  build: { assets: '_astro' },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  trailingSlash: 'never',
  compressHTML: true,
});
