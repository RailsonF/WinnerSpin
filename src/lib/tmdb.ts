import type {
  TmdbMovieDetails,
  TmdbWatchOption,
  TmdbWatchResponse,
} from '../types'

const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL ?? 'https://api.themoviedb.org/3'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p'

export const BR_REGION = 'BR'

export function isTmdbConfigured(): boolean {
  return Boolean(TMDB_API_KEY)
}

export function getPosterUrl(
  posterPath: string | null,
  size: 'w185' | 'w342' | 'w500' = 'w500',
): string | null {
  if (!posterPath) return null
  return `${TMDB_IMAGE_URL}/${size}${posterPath}`
}

export function getProviderLogoUrl(
  logoPath: string | null,
  size: 'w45' | 'w92' | 'w154' = 'w92',
): string | null {
  if (!logoPath) return null
  return `${TMDB_IMAGE_URL}/${size}${logoPath}`
}

async function request<T>(path: string): Promise<T> {
  const url = new URL(`${TMDB_API_URL}${path}`)
  url.searchParams.set('api_key', TMDB_API_KEY ?? '')
  url.searchParams.set('language', 'pt-BR')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Falha ao consultar o TMDB (${response.status})`)
  }
  return response.json() as Promise<T>
}

export function fetchMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
  return request<TmdbMovieDetails>(`/movie/${tmdbId}`)
}

export function fetchWatchProviders(
  tmdbId: number,
  region: string = BR_REGION,
): Promise<TmdbWatchOption | null> {
  return request<TmdbWatchResponse>(`/movie/${tmdbId}/watch/providers`).then(
    (response) => response.results[region] ?? null,
  )
}
