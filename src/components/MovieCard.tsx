import { Clock, Film, Star, Trophy } from 'lucide-react'
import { getPosterUrl, getProviderLogoUrl } from '../lib/tmdb'
import type {
  OscarWinner,
  TmdbMovieDetails,
  TmdbWatchOption,
} from '../types'
import './MovieCard.css'

interface MovieCardProps {
  movie: OscarWinner
  details: TmdbMovieDetails | null
  providers: TmdbWatchOption | null
  isLoading: boolean
  error: string | null
}

type ProviderGroup = 'flatrate' | 'rent' | 'buy'

const PROVIDER_GROUPS: { key: ProviderGroup; label: string }[] = [
  { key: 'flatrate', label: 'Streaming' },
  { key: 'rent', label: 'Aluguel' },
  { key: 'buy', label: 'Compra' },
]

export function MovieCard({
  movie,
  details,
  providers,
  isLoading,
  error,
}: MovieCardProps) {
  const posterUrl = getPosterUrl(details?.poster_path ?? null)

  return (
    <article className="movie-card">
      <div className="movie-card__poster">
        {isLoading ? (
          <div
            className="movie-card__skeleton h-full w-full"
            aria-label="Carregando pôster"
          />
        ) : posterUrl ? (
          <img
            src={posterUrl}
            alt={`Pôster de ${details?.title ?? movie.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-600">
            <Film className="h-10 w-10" aria-hidden="true" />
            <span className="text-xs">Pôster indisponível</span>
          </div>
        )}
      </div>

      <div className="movie-card__content">
        {isLoading ? (
          <div className="flex flex-col gap-3" aria-label="Carregando detalhes">
            <div className="movie-card__skeleton h-7 w-3/4" />
            <div className="movie-card__skeleton h-4 w-1/2" />
            <div className="movie-card__skeleton h-24 w-full" />
            <div className="movie-card__skeleton h-10 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <>
            <h3 className="font-display text-2xl font-semibold leading-tight text-gold-300">
              {details?.title ?? movie.title}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
              <span>Melhor Filme · {movie.win_year}</span>
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-4 w-4 text-gold-400" aria-hidden="true" />
                {movie.statuettes} estatueta{movie.statuettes === 1 ? '' : 's'}
              </span>
              {details?.runtime ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {formatRuntime(details.runtime)}
                </span>
              ) : null}
              {details?.vote_average ? (
                <span className="inline-flex items-center gap-1">
                  <Star
                    className="h-4 w-4 fill-gold-400 text-gold-400"
                    aria-hidden="true"
                  />
                  {details.vote_average.toFixed(1).replace('.', ',')}
                </span>
              ) : null}
            </div>
            {details?.genres.length ? (
              <p className="text-sm text-zinc-500">
                {details.genres.map((genre) => genre.name).join(' · ')}
              </p>
            ) : null}
            <p className="text-sm leading-relaxed text-zinc-300">
              {details?.overview || 'Sinopse indisponível.'}
            </p>
            <WhereToWatch providers={providers} />
          </>
        )}
      </div>
    </article>
  )
}

function WhereToWatch({ providers }: { providers: TmdbWatchOption | null }) {
  if (!providers) {
    return (
      <p className="text-sm text-zinc-500">
        Não encontramos opções de streaming para este filme no Brasil.
      </p>
    )
  }

  const hasGroups = PROVIDER_GROUPS.some(
    ({ key }) => (providers[key]?.length ?? 0) > 0,
  )

  if (!hasGroups) {
    return (
      <p className="text-sm text-zinc-500">
        Não encontramos opções de streaming para este filme no Brasil.
      </p>
    )
  }

  const link = providers.link || 'https://www.themoviedb.org'

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-500">
        Onde assistir no Brasil
      </h4>
      {PROVIDER_GROUPS.map(({ key, label }) => {
        const items = providers[key]
        if (!items?.length) return null
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">{label}</span>
            <div className="flex flex-wrap gap-2">
              {items.map((provider) => {
                const logoUrl = getProviderLogoUrl(provider.logo_path)
                return (
                  <a
                    key={provider.provider_id}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="movie-card__provider"
                    title={provider.provider_name}
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={provider.provider_name}
                        loading="lazy"
                        className="h-9 w-9 rounded-md bg-white/10 object-contain p-0.5"
                      />
                    ) : (
                      <span className="flex h-9 items-center rounded-md bg-night-700 px-2 text-xs font-medium text-zinc-200">
                        {provider.provider_name}
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
}

export default MovieCard
