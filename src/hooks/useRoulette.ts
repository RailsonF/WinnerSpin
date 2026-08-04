import { useCallback, useRef, useState } from 'react'
import type { OscarWinner } from '../types'

const MIN_FULL_SPINS = 5
const MAX_FULL_SPINS = 8

export function useRoulette(items: OscarWinner[]) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<OscarWinner | null>(null)
  const rotationRef = useRef(0)

  const spin = useCallback(() => {
    if (isSpinning || items.length === 0) return

    const count = items.length
    const segmentAngle = 360 / count
    const index = Math.floor(Math.random() * count)
    const chosen = items[index]

    const center = index * segmentAngle + segmentAngle / 2
    const desiredResidue = ((360 - center) % 360 + 360) % 360
    const currentResidue = ((rotationRef.current % 360) + 360) % 360
    const adjust = desiredResidue - currentResidue
    const fullSpins =
      MIN_FULL_SPINS +
      Math.floor(Math.random() * (MAX_FULL_SPINS - MIN_FULL_SPINS + 1))
    const jitter = (Math.random() - 0.5) * segmentAngle * 0.6

    const target = rotationRef.current + fullSpins * 360 + adjust + jitter
    rotationRef.current = target

    setWinner(chosen)
    setIsSpinning(true)
    setRotation(target)
  }, [items, isSpinning])

  const onAnimationComplete = useCallback(() => {
    setIsSpinning(false)
  }, [])

  return { rotation, isSpinning, winner, spin, onAnimationComplete }
}
