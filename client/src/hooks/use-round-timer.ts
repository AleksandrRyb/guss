import { useEffect, useState } from 'react'
import type { RoundDetails } from '../lib/api/rounds'
import { ROUNDS, type RoundStatus } from '../lib/constants/rounds'

export interface UseRoundTimerState {
  seconds: number
  phase: RoundStatus
}

export function useRoundTimer(details?: RoundDetails): UseRoundTimerState {
  const [seconds, setSeconds] = useState<number>(0)
  const [phase, setPhase] = useState<RoundStatus>(ROUNDS.STATUS.cooldown)

  useEffect(() => {
    if (!details) return
    const startTs = new Date(details.startAt).getTime()
    const endTs = new Date(details.endAt).getTime()
    const TICK_MS = 250
    let currentPhase: RoundStatus = details.status as RoundStatus
    let targetTs = currentPhase === ROUNDS.STATUS.cooldown ? startTs : currentPhase === ROUNDS.STATUS.active ? endTs : 0
    setPhase(currentPhase)
    setSeconds(Math.max(0, Math.ceil((targetTs - Date.now()) / 1000)))
    if (currentPhase === ROUNDS.STATUS.finished) return
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetTs - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining <= 0) {
        if (currentPhase === ROUNDS.STATUS.cooldown) {
          currentPhase = ROUNDS.STATUS.active
          targetTs = endTs
          setPhase(ROUNDS.STATUS.active)
          setSeconds(Math.max(0, Math.ceil((targetTs - Date.now()) / 1000)))
        } else if (currentPhase === ROUNDS.STATUS.active) {
          currentPhase = ROUNDS.STATUS.finished
          setPhase(ROUNDS.STATUS.finished)
          setSeconds(0)
          clearInterval(id)
        }
      }
    }, TICK_MS)
    return () => clearInterval(id)
  }, [details])

  return { seconds, phase }
}


