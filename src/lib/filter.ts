import type { OscarWinner } from '../types'

export function getDecades(movies: OscarWinner[]): number[] {
  const decades = new Set<number>()
  for (const movie of movies) {
    decades.add(Math.floor(movie.win_year / 10) * 10)
  }
  return [...decades].sort((a, b) => a - b)
}

export function filterByDecade(
  movies: OscarWinner[],
  decade: number | null,
): OscarWinner[] {
  if (decade === null) return movies
  return movies.filter(
    (movie) => Math.floor(movie.win_year / 10) * 10 === decade,
  )
}

export function filterByProviders(
  movies: OscarWinner[],
  providerIds: number[],
  availability: ReadonlyMap<number, number[]>,
): OscarWinner[] {
  if (providerIds.length === 0) return movies
  return movies.filter((movie) => {
    const providers = availability.get(movie.tmdb_id)
    return providers?.some((id) => providerIds.includes(id)) ?? false
  })
}
