import { api } from './http'

export interface Round {
  id: string
  startAt: string
  endAt: string
  status: string
}

export async function getRounds(): Promise<Round[]> {
  const { data } = await api.get<Round[]>('/rounds')
  return data
}

export async function createRound(): Promise<Round> {
  const { data } = await api.post<Round>('/rounds')
  return data
}

export interface RoundDetails extends Round {
  secondsUntilStart: number
  secondsUntilEnd: number
  stats?: {
    playersTotal: number
    tapsTotal: number
    scoreTotal: number
    winner: { userId: string; username: string; score: number }
  }
}

export async function getRoundById(id: string): Promise<RoundDetails> {
  const { data } = await api.get<RoundDetails>(`/rounds/${id}`)
  return data
}

export interface TapResponse {
  taps: number
  score: number
}

export async function tapRound(id: string): Promise<TapResponse> {
  const { data } = await api.post<TapResponse>(`/rounds/${id}/tap`)
  return data
}


