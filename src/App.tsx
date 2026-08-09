import { useState } from 'react'
import MovieCard from './components/MovieCard'
import Roulette from './components/Roulette'
import oscarWinners from './data/oscar-winners.json'
import { useMovieDetails } from './hooks/useMovieDetails'
import type { OscarWinner } from './types'

function App() {
  const [selected, setSelected] = useState<OscarWinner | null>(null)
  const { details, providers, isLoading, error } = useMovieDetails(
    selected?.tmdb_id ?? null,
  )

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

      <Roulette movies={oscarWinners as OscarWinner[]} onSelect={setSelected} />

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
