import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useRoulette } from '../hooks/useRoulette'
import type { OscarWinner } from '../types'
import './Roulette.css'

interface RouletteProps {
  movies: OscarWinner[]
  onSelect: (movie: OscarWinner) => void
  size?: number
  disabled?: boolean
  disabledLabel?: string
}

const SEGMENT_COLORS = ['#2a2340', '#171422']
const DECELERATION: [number, number, number, number] = [0.12, 0.8, 0.14, 1]
const SPIN_DURATION = 5.2

export function Roulette({
  movies,
  onSelect,
  size = 460,
  disabled = false,
  disabledLabel = 'Aguarde…',
}: RouletteProps) {
  const { rotation, isSpinning, winner, spin, onAnimationComplete } =
    useRoulette(movies)

  const count = movies.length
  const segmentAngle = count > 0 ? 360 / count : 360
  const segments =
    count > 0
      ? `repeating-conic-gradient(from 0deg, ${SEGMENT_COLORS[0]} 0deg ${segmentAngle}deg, ${SEGMENT_COLORS[1]} ${segmentAngle}deg ${segmentAngle * 2}deg)`
      : 'none'
  const dividers =
    count > 0
      ? `repeating-conic-gradient(from 0deg, transparent 0deg ${segmentAngle - 0.5}deg, rgba(0, 0, 0, 0.55) ${segmentAngle - 0.5}deg ${segmentAngle}deg)`
      : 'none'

  const handleSpin = () => {
    if (isSpinning || disabled) return
    spin()
  }

  const handleAnimationComplete = () => {
    onAnimationComplete()
    if (winner) onSelect(winner)
  }

  return (
    <div
      className="roulette"
      style={{ '--wheel-size': `min(${size}px, 88vw)` } as CSSProperties}
    >
      <motion.div
        className="roulette__wheel"
        role="img"
        aria-label="Roleta dos vencedores do Oscar"
        animate={{ rotate: rotation }}
        transition={{ duration: SPIN_DURATION, ease: DECELERATION }}
        onAnimationComplete={handleAnimationComplete}
      >
        <div className="roulette__segments" style={{ background: segments }} />
        <div className="roulette__dividers" style={{ background: dividers }} />
        <div className="roulette__labels">
          {movies.map((movie, index) => {
            const angle = index * segmentAngle + segmentAngle / 2
            return (
              <span
                key={movie.tmdb_id}
                className="roulette__label"
                title={movie.title}
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(var(--wheel-size) * -0.34)) rotate(90deg)`,
                }}
              >
                {movie.title}
              </span>
            )
          })}
        </div>
      </motion.div>

      <div className="roulette__pointer" aria-hidden="true" />

      <div className="roulette__hub">
        <button
          type="button"
          className="roulette__spin-button"
          onClick={handleSpin}
          disabled={isSpinning || disabled}
        >
          {isSpinning ? 'Girando…' : disabled ? disabledLabel : 'Girar'}
        </button>
      </div>
    </div>
  )
}

export default Roulette
