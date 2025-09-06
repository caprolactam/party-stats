const TAB_KEY = 'tab'
export const TAB_OPTIONS = {
  voters: {
    label: '投票率',
  },
  votes: {
    label: '無効投票率',
  },
}
type Tab = keyof typeof TAB_OPTIONS
const DEFAULT_TAB: Tab = 'voters'

export function getTab(searchParams: URLSearchParams): Tab {
  const tab = searchParams.get(TAB_KEY)

  if (!tab) return DEFAULT_TAB
  if (Object.keys(TAB_OPTIONS).includes(tab)) return tab as Tab

  return DEFAULT_TAB
}
