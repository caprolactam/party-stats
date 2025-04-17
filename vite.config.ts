import build from '@hono/vite-build/cloudflare-workers'
import devServer, { defaultOptions } from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, type UserConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client' || mode === 'client-analysis') {
    return {
      build: {
        rollupOptions: {
          input: './src/main.tsx',
          output: {
            dir: './dist/client',
            entryFileNames: 'entry-client.js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: ({ names }) => {
              // https://zenn.dev/link/comments/8caaaeb4bdea1d
              if ((names[0] ?? '').endsWith('.css')) {
                return 'assets/index.css'
              } else {
                return 'assets/[name][extname]'
              }
            },
          },
        },
        sourcemap: mode === 'client-analysis',
      },
      plugins: [
        tailwindcss(),
        TanStackRouterVite({
          autoCodeSplitting: true,
        }),
        mode === 'client-analysis'
          ? visualizer({ emitFile: true, sourcemap: true })
          : null,
        react(),
      ].filter(Boolean),
    } satisfies UserConfig
  }

  return {
    ssr: {
      external: ['react', 'react-dom'],
    },
    publicDir: mode === 'development' ? 'public' : false,
    plugins: [
      build({
        entry: './worker/index.tsx',
        outputDir: './dist/server',
        output: 'index.js',
        minify: false,
      }),
      tailwindcss(),
      mode === 'server-analysis' ? visualizer({ emitFile: true }) : null,
      devServer({
        adapter: adapter,
        entry: './worker/index.tsx',
        exclude: [/\.json.*/, /\.css/, /\.ts/, ...defaultOptions.exclude],
      }),
    ].filter(Boolean),
  } satisfies UserConfig
})
