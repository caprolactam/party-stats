import { createId } from '@paralleldrive/cuid2'
import { text } from 'drizzle-orm/sqlite-core'

export const id = text('id').primaryKey()
  .$defaultFn(createId)
