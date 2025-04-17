import {
  type Cache as CachifiedCache,
  type CacheMetadata,
  totalTtl,
} from '@epic-web/cachified'
import { connectKv } from './databases.ts'

export function connectCache(type: 'text' | 'json' = 'text') {
  const kv = connectKv()

  const cache: CachifiedCache = {
    name: 'KV cache',
    async get(key) {
      if (type === 'text') {
        const { value, metadata } = await kv.getWithMetadata<CacheMetadata>(
          key,
          {
            type: 'text',
          },
        )
        if (value === null) {
          return value
        }
        return {
          // Note that parse can potentially throw an error here and the expectation is that the user of the adapter catches it
          value: JSON.parse(value),
          metadata: metadata!,
        }
      }

      const { value, metadata } = await kv.getWithMetadata<
        unknown,
        CacheMetadata
      >(key, {
        type: 'json',
      })
      if (value === null) {
        return value
      }
      return {
        value,
        metadata: metadata!,
      }
    },
    async set(key, entry) {
      let expirationTtl: number | undefined = totalTtl(entry.metadata)
      if (expirationTtl === Infinity) {
        expirationTtl = undefined
      } else {
        expirationTtl = Math.max(Math.ceil(expirationTtl / 1000), 60)
      }

      await kv.put(key, JSON.stringify(entry.value), {
        expirationTtl: expirationTtl,
        metadata: entry.metadata,
      })
    },
    async delete(key: string) {
      await kv.delete(key)
    },
  }

  return cache
}
