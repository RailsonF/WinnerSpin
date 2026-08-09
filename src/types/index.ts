export interface OscarWinner {
  tmdb_id: number
  title: string
  oscar_year: number
  win_year: number
  statuettes: number
  category: string
}

export interface TmdbGenre {
  id: number
  name: string
}

export interface TmdbMovieDetails {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  runtime: number | null
  vote_average: number
  genres: TmdbGenre[]
}

export interface TmdbWatchProvider {
  provider_id: number
  provider_name: string
  logo_path: string | null
  display_priority: number
}

export interface TmdbWatchOption {
  link: string
  flatrate?: TmdbWatchProvider[]
  rent?: TmdbWatchProvider[]
  buy?: TmdbWatchProvider[]
}

export interface TmdbWatchResponse {
  id: number
  results: Partial<Record<string, TmdbWatchOption>>
}
