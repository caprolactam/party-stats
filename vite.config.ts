import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import type { UserConfig, PluginOption } from 'vite'
import babel from 'vite-plugin-babel'
import { iconsSpritesheet as iconsSpritesheetPlugin } from 'vite-plugin-icons-spritesheet'
import tsconfigPaths from 'vite-tsconfig-paths'

const MODE = process.env.NODE_ENV
const IS_TEST = MODE === 'test'

export default defineConfig(({ mode }) => {
  const shouldAnalyze = mode === 'analysis'

  return {
    build: {
      sourcemap: shouldAnalyze,
    },
    plugins: [
      reactCompiler(),
      tailwindcss(),
      iconsSpritesheet(),
      cloudflare({ viteEnvironment: { name: 'ssr' } }),
      IS_TEST ? null : reactRouter(),
      shouldAnalyze ? buildSizeAnalyzer() : null,
      tsconfigPaths(),
    ].filter(Boolean),
  } satisfies UserConfig
})

function reactCompiler(): PluginOption {
  return {
    ...babel({
      filter: /\.tsx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    apply: 'build',
  }
}

function iconsSpritesheet(): PluginOption {
  return iconsSpritesheetPlugin({
    withTypes: true,
    inputDir: './svg-icons',
    outputDir: './app/components/icons',
    typesOutputFile: './app/components/icons/types.ts',
    fileName: 'sprite.svg',
    iconNameTransformer: (name) => name,
  })
}

function buildSizeAnalyzer(): PluginOption {
  return visualizer({
    emitFile: true,
    sourcemap: true,
  })
}
