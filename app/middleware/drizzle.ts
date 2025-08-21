import { database } from '~/db/index.ts'
import { unstable_createSingletonMiddleware } from '~/lib/singleton.ts'
import { getBindings } from './bindings.ts'
import { getContext } from './context-storage.ts'

const [drizzleMiddleware, getDBFromContext] = unstable_createSingletonMiddleware({
  instantiator() {
    return database(getBindings().db)
  },
})

export function getDB() {
  const context = getContext()
  return getDBFromContext(context)
}

export { drizzleMiddleware }
