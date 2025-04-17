import { queryOptions } from '@tanstack/react-query'
import { type ListElections } from '#api/schema'

export const listElectionsQueryOptions = queryOptions({
  queryKey: ['elections'],
  queryFn: async () => {
    const response = await fetch('/api/elections')
    if (!response.ok) {
      throw new Error('Failed to fetch elections')
    }
    return (await response.json()) as ListElections
  },
  staleTime: Infinity,
})
