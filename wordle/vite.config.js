import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [svelte()],
  build: {
    rollupOptions: {
      output: {
        // Content-hashed filenames make each deploy's assets unique, so a
        // stale cached bundle can never be served alongside a new index.html.
        assetFileNames: "[name]-[hash][extname]",
        entryFileNames: "[name]-[hash].js",
        dir: "./dist",
      }
    }
  }
});
