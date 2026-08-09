import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { getProviderLogoUrl, isTmdbConfigured } from '../lib/tmdb'
import type { TmdbWatchProvider } from '../types'
import './FilterBar.css'

interface FilterBarProps {
  decades: number[]
  decade: number | null
  onDecadeChange: (decade: number | null) => void
  providers: TmdbWatchProvider[]
  selectedProviderIds: number[]
  onProviderToggle: (providerId: number) => void
  onClearProviders: () => void
  availabilityLoading: boolean
}

type Panel = 'decade' | 'providers' | null

export function FilterBar({
  decades,
  decade,
  onDecadeChange,
  providers,
  selectedProviderIds,
  onProviderToggle,
  onClearProviders,
  availabilityLoading,
}: FilterBarProps) {
  const [openPanel, setOpenPanel] = useState<Panel>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenPanel(null)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPanel(null)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const togglePanel = (panel: Exclude<Panel, null>) => {
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  const closePanel = () => setOpenPanel(null)

  const selectDecade = (item: number | null) => {
    onDecadeChange(item)
    closePanel()
  }

  return (
    <div className="filter-bar" ref={containerRef}>
      <div className="filter-dropdown">
        <button
          type="button"
          className={`filter-trigger${
            openPanel === 'decade' ? ' filter-trigger--open' : ''
          }`}
          aria-haspopup="listbox"
          aria-expanded={openPanel === 'decade'}
          onClick={() => togglePanel('decade')}
        >
          {decade === null ? 'Todas as décadas' : `Anos ${decade}`}
          <ChevronDown
            className="filter-trigger__icon"
            size={16}
            aria-hidden="true"
          />
        </button>

        {openPanel === 'decade' && (
          <div
            className="filter-panel filter-panel--left"
            role="listbox"
            aria-label="Década"
          >
            <div className="filter-options">
              <button
                type="button"
                role="option"
                aria-selected={decade === null}
                className={`filter-option${
                  decade === null ? ' filter-option--selected' : ''
                }`}
                onClick={() => selectDecade(null)}
              >
                <span className="filter-check">
                  {decade === null && <Check size={12} />}
                </span>
                Todas as décadas
              </button>
              {decades.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={decade === item}
                  className={`filter-option${
                    decade === item ? ' filter-option--selected' : ''
                  }`}
                  onClick={() => selectDecade(decade === item ? null : item)}
                >
                  <span className="filter-check">
                    {decade === item && <Check size={12} />}
                  </span>
                  Anos {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="filter-dropdown">
        <button
          type="button"
          className={`filter-trigger${
            openPanel === 'providers' ? ' filter-trigger--open' : ''
          }`}
          aria-haspopup="listbox"
          aria-expanded={openPanel === 'providers'}
          onClick={() => togglePanel('providers')}
        >
          <span>Streaming</span>
          {selectedProviderIds.length > 0 && (
            <span className="filter-badge">{selectedProviderIds.length}</span>
          )}
          <ChevronDown
            className="filter-trigger__icon"
            size={16}
            aria-hidden="true"
          />
        </button>

        {openPanel === 'providers' && (
          <div
            className="filter-panel filter-panel--right"
            role="listbox"
            aria-label="Plataformas de streaming"
          >
            {!isTmdbConfigured() ? (
              <p className="filter-note">
                Configure a chave TMDB no .env para filtrar por plataformas de
                streaming.
              </p>
            ) : providers.length === 0 ? (
              <p className="filter-note">
                Nenhum provedor encontrado para o Brasil.
              </p>
            ) : (
              <>
                <div className="filter-options">
                  {providers.map((provider) => {
                    const selected = selectedProviderIds.includes(
                      provider.provider_id,
                    )
                    const logoUrl = getProviderLogoUrl(
                      provider.logo_path,
                      'w45',
                    )
                    return (
                      <button
                        key={provider.provider_id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`filter-option${
                          selected ? ' filter-option--selected' : ''
                        }`}
                        onClick={() => onProviderToggle(provider.provider_id)}
                      >
                        <span className="filter-check">
                          {selected && <Check size={12} />}
                        </span>
                        {logoUrl && (
                          <img
                            src={logoUrl}
                            alt=""
                            aria-hidden="true"
                            className="h-5 w-5 rounded object-contain"
                          />
                        )}
                        <span className="min-w-0 flex-1 truncate">
                          {provider.provider_name}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {selectedProviderIds.length > 0 && (
                  <button
                    type="button"
                    className="filter-clear"
                    onClick={onClearProviders}
                  >
                    Limpar seleção
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {availabilityLoading && (
        <span className="filter-status" role="status">
          Carregando disponibilidade…
        </span>
      )}
    </div>
  )
}

export default FilterBar
