import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import pkg from "./package.json" with { type: "json" };

const { version } = pkg;

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [svelte()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: `[name]-v${version}.[ext]`,
        entryFileNames: `[name]-v${version}.js`,
        dir: "./dist",
      }
    }
  }
});
