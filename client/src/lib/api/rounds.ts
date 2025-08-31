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


