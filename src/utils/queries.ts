import { notFound } from '@tanstack/react-router'
import { type ListParties, type ListElections } from '#api/schema'

export async function listParties(electionCode: string) {
  try {
    const response = await fetch(`/api/elections/${electionCode}/parties`)
    if (response.status === 404) {
      const errorMessage = await response.json()
      throw notFound({ data: errorMessage })
    }
    if (!response.ok) {
      throw new Error('Failed to fetch parties')
    }

    const parties = (await response.json()) as ListParties

    return parties
  } catch (error) {
    console.error(error)
    throw new Error('Failed to fetch parties')
  }
}

export async function listElections() {
  try {
    const response = await fetch('/api/elections')
    if (!response.ok) {
      throw new Error('Failed to fetch elections')
    }

    return (await response.json()) as ListElections
  } catch (error) {
    console.error(error)
    throw new Error('Failed to fetch elections')
  }
}
