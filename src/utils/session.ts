import * as v from 'valibot'

const COMPARE_PARTY_KEY = 'compare-party-fallback'
export const comparePartySchema = v.string()
export const comparePartySession = {
  get: () => {
    try {
      const data = sessionStorage.getItem(COMPARE_PARTY_KEY)
      if (!data) return
      return v.parse(comparePartySchema, data)
    } catch {
      sessionStorage.removeItem(COMPARE_PARTY_KEY)
      return
    }
  },
  set: (value: string) => {
    sessionStorage.setItem(COMPARE_PARTY_KEY, value)
  },
  remove: () => {
    sessionStorage.removeItem(COMPARE_PARTY_KEY)
  },
}
