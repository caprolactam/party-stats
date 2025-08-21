import { redirect, data } from 'react-router'
import type { Route } from './+types/route.ts'
import { getNationalArea } from './queries.ts'

/**
 * インデックスルートへのアクセスは、全国内の地域選択ページにリダイレクトします。
 * `/areas` => `/areas/${全国のarea_id}`
 */
export async function loader(_: Route.LoaderArgs) {
  const result = await getNationalArea()

  if (result.isErr()) {
    const { type, message } = result.error

    switch (type) {
      case 'notFound':
        throw data(message, { status: 404 })
      case 'network':
        throw data(message, { status: 500 })
      default:
        const _: never = type
        throw Error(`Unexpected error type: ${type}`)
    }
  }

  throw redirect(`/areas/${result.value.code}`)
}
