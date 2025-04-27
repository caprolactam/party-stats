import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, type UserConfig } from 'vite'
import babel from 'vite-plugin-babel'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

export default defineConfig(({ mode }) => {
  const isAnalysis = mode === 'analysis'

  return {
    build: {
      sourcemap: isAnalysis,
    },
    plugins: [
      {
        ...babel({
          filter: /\.tsx?$/,
          babelConfig: {
            presets: ['@babel/preset-typescript'],
            plugins: ['babel-plugin-react-compiler'],
          },
        }),
        apply: 'build',
      },
      tailwindcss(),
      iconsSpritesheet({
        withTypes: true,
        inputDir: './scripts/svg-icons',
        outputDir: './public',
        typesOutputFile: './src/components/icons/types.ts',
        fileName: 'sprite.svg',
        iconNameTransformer: (name) => name,
      }),
      TanStackRouterVite({
        autoCodeSplitting: true,
      }),
      react(),
      cloudflare(),
      isAnalysis
        ? visualizer({
            emitFile: true,
            sourcemap: true,
          })
        : null,
    ].filter(Boolean),
  } satisfies UserConfig
})
