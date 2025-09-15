import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { TRPCClientError } from '@trpc/client'
import superjson from 'superjson'

function httpStatusOf(error: unknown): number | undefined {
  if (!(error instanceof TRPCClientError)) return undefined
  const status = error.data?.httpStatus
  return typeof status === 'number' ? status : undefined
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        // An expense that is not there will not be there on the second ask
        // either. Retrying a 4xx only doubles the console noise and the wait
        // before the screen can say what happened; a 5xx or a dropped
        // connection still gets its second chance.
        retry: (failureCount, error) => {
          const status = httpStatusOf(error)
          if (status !== undefined && status >= 400 && status < 500)
            return false
          return failureCount < 1
        },
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}
