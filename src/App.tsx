import { useEffect, useMemo, useState } from 'react'
import FilterBar from './components/FilterBar'
import MovieCard from './components/MovieCard'
import Roulette from './components/Roulette'
import oscarWinners from './data/oscar-winners.json'
import { useMovieDetails } from './hooks/useMovieDetails'
import { useWatchProviders } from './hooks/useWatchProviders'
import { filterByDecade, filterByProviders, getDecades } from './lib/filter'
import type { OscarWinner, RouletteFilters } from './types'

const MOVIES = oscarWinners as OscarWinner[]

function App() {
  const [selected, setSelected] = useState<OscarWinner | null>(null)
  const [filter, setFilter] = useState<RouletteFilters>({
    decade: null,
    providerIds: [],
  })
  const {
    availableProviders,
    availability,
    ensureLoaded,
    isLoadedFor,
  } = useWatchProviders()
  const { details, providers, isLoading, error } = useMovieDetails(
    selected?.tmdb_id ?? null,
  )

  const decades = useMemo(() => getDecades(MOVIES), [])
  const byDecade = useMemo(
    () => filterByDecade(MOVIES, filter.decade),
    [filter.decade],
  )
  const scopeIds = useMemo(
    () => byDecade.map((movie) => movie.tmdb_id),
    [byDecade],
  )
  const providerFilterActive = filter.providerIds.length > 0
  const availabilityReady = providerFilterActive
    ? isLoadedFor(scopeIds)
    : true

  useEffect(() => {
    if (!providerFilterActive || availabilityReady) return
    void ensureLoaded(scopeIds)
  }, [providerFilterActive, availabilityReady, scopeIds, ensureLoaded])

  const eligible = useMemo(() => {
    if (providerFilterActive && !availabilityReady) return []
    return providerFilterActive
      ? filterByProviders(byDecade, filter.providerIds, availability)
      : byDecade
  }, [providerFilterActive, availabilityReady, byDecade, filter.providerIds, availability])

  const handleDecadeChange = (decade: number | null) => {
    setFilter((prev) => ({ ...prev, decade }))
  }

  const handleProviderToggle = (providerId: number) => {
    setFilter((prev) => ({
      ...prev,
      providerIds: prev.providerIds.includes(providerId)
        ? prev.providerIds.filter((id) => id !== providerId)
        : [...prev.providerIds, providerId],
    }))
  }

  const handleClearProviders = () => {
    setFilter((prev) => ({ ...prev, providerIds: [] }))
  }

  const availabilityPending = providerFilterActive && !availabilityReady
  const rouletteDisabled = availabilityPending || eligible.length === 0
  const rouletteDisabledLabel = availabilityPending
    ? 'Carregando…'
    : eligible.length === 0
      ? 'Sem resultados'
      : undefined

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 py-10">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          Roleta do Oscar
        </p>
        <h1 className="font-display mt-2 text-5xl font-semibold tracking-tight text-gold-400">
          WinnerSpin
        </h1>
        <p className="mt-3 text-zinc-400">
          Gire a roleta e descubra o próximo vencedor do Oscar para assistir.
        </p>
      </header>

      <FilterBar
        decades={decades}
        decade={filter.decade}
        onDecadeChange={handleDecadeChange}
        providers={availableProviders}
        selectedProviderIds={filter.providerIds}
        onProviderToggle={handleProviderToggle}
        onClearProviders={handleClearProviders}
        availabilityLoading={availabilityPending}
      />

      <Roulette
        movies={eligible}
        onSelect={setSelected}
        disabled={rouletteDisabled}
        disabledLabel={rouletteDisabledLabel}
      />

      {selected && (
        <MovieCard
          movie={selected}
          details={details}
          providers={providers}
          isLoading={isLoading}
          error={error}
        />
      )}
    </main>
  )
}

export default App
