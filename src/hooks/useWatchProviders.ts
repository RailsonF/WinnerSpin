import { useCallback, useEffect, useState } from 'react'
import {
  fetchAvailableProviders,
  fetchWatchProviders,
  getMovieProviderIds,
  isTmdbConfigured,
} from '../lib/tmdb'
import type { TmdbWatchProvider } from '../types'

const BATCH_SIZE = 5

export function useWatchProviders() {
  const configured = isTmdbConfigured()
  const [availableProviders, setAvailableProviders] = useState<
    TmdbWatchProvider[]
  >([])
  const [availability, setAvailability] = useState<ReadonlyMap<
    number,
    number[]
  >>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!configured) return

    let cancelled = false
    fetchAvailableProviders()
      .then(({ results }) => {
        if (!cancelled) setAvailableProviders(results)
      })
      .catch(() => {
        if (!cancelled) setAvailableProviders([])
      })

    return () => {
      cancelled = true
    }
  }, [configured])

  const ensureLoaded = useCallback(
    async (tmdbIds: number[]) => {
      if (!configured) return
      const missing = tmdbIds.filter((id) => !availability.has(id))
      if (missing.length === 0) return

      setIsLoading(true)
      const results = new Map<number, number[]>()

      for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const batch = missing.slice(i, i + BATCH_SIZE)
        const settled = await Promise.allSettled(
          batch.map((id) =>
            fetchWatchProviders(id).then((watchOption) => ({
              id,
              providerIds: getMovieProviderIds(watchOption),
            })),
          ),
        )
        for (const result of settled) {
          if (result.status === 'fulfilled') {
            results.set(result.value.id, result.value.providerIds)
          }
        }
      }

      for (const id of missing) {
        if (!results.has(id)) results.set(id, [])
      }

      setIsLoading(false)
      setAvailability((prev) => {
        const next = new Map(prev)
        for (const [id, providerIds] of results) next.set(id, providerIds)
        return next
      })
    },
    [availability, configured],
  )

  const isLoadedFor = useCallback(
    (tmdbIds: number[]) => tmdbIds.every((id) => availability.has(id)),
    [availability],
  )

  return {
    availableProviders,
    availability,
    isLoading,
    ensureLoaded,
    isLoadedFor,
  }
}
