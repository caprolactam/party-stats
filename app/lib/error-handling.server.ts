import { data } from 'react-router'
import type { ApiErrors } from '~/types/api-error.ts'

export function handleApiError(error: ApiErrors[keyof ApiErrors]): never {
  const { message, type } = error

  switch (type) {
    case 'badRequest':
      throw data(message, { status: 400 })
    case 'notFound':
      throw data(message, { status: 404 })
    case 'network':
      throw data(message, { status: 500 })
    default:
      const _: never = type
      throw new Error(`Unhandled error type: ${_}`)
  }
}
