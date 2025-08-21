import { unstable_createContextStorageMiddleware } from '~/lib/context-storage.ts'

export const [contextStorageMiddleware, getContext, getRequest] = unstable_createContextStorageMiddleware()
