import type { Config } from '@react-router/dev/config'

export default {
  ssr: true,
  future: {
    unstable_middleware: true,
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: true,
    unstable_subResourceIntegrity: true,
    unstable_viteEnvironmentApi: true,
  },
  // プリレンダーをコメントアウト（プリレンダー時にCloudflare Bindingsが利用できないため）
  // TODO: プリレンダー対応のためのスタティックデータモード実装が必要
  // prerender: ['/'],
} satisfies Config
