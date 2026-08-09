import { useEffect, useState } from 'react'
import {
  fetchMovieDetails,
  fetchWatchProviders,
  isTmdbConfigured,
} from '../lib/tmdb'
import type { TmdbMovieDetails, TmdbWatchOption } from '../types'

export interface UseMovieDetailsResult {
  details: TmdbMovieDetails | null
  providers: TmdbWatchOption | null
  isLoading: boolean
  error: string | null
}

interface MovieDetailsState {
  requestedId: number | null
  details: TmdbMovieDetails | null
  providers: TmdbWatchOption | null
  error: string | null
}

const EMPTY_STATE: MovieDetailsState = {
  requestedId: null,
  details: null,
  providers: null,
  error: null,
}

export function useMovieDetails(tmdbId: number | null): UseMovieDetailsResult {
  const configured = isTmdbConfigured()
  const [state, setState] = useState<MovieDetailsState>(EMPTY_STATE)

  useEffect(() => {
    if (tmdbId === null || !configured) return

    let cancelled = false

    Promise.all([fetchMovieDetails(tmdbId), fetchWatchProviders(tmdbId)])
      .then(([details, providers]) => {
        if (cancelled) return
        setState({ requestedId: tmdbId, details, providers, error: null })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({
          requestedId: tmdbId,
          details: null,
          providers: null,
          error:
            error instanceof Error ? error.message : 'Erro ao consultar o TMDB.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [tmdbId, configured])

  const notConfigured = tmdbId !== null && !configured
  const isCurrent = state.requestedId === tmdbId

  return {
    details: isCurrent && !notConfigured ? state.details : null,
    providers: isCurrent && !notConfigured ? state.providers : null,
    isLoading: tmdbId !== null && !isCurrent && !notConfigured,
    error: notConfigured
      ? "Chave Tmdb não configurada"
      : isCurrent
        ? state.error
        : null
  }
}
