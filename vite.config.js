import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
//
// `base` tells Vite where the site will be served from.
//   - For GitHub Pages at username.github.io/repo-name/, set base to '/repo-name/'
//   - For a custom domain or Netlify, set base to '/'
//
// The `BASE_PATH` env variable lets the GitHub Actions workflow override this.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
});
