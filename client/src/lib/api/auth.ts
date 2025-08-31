import { api } from './http'
import { saveTokens } from '../utils/auth'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password })
  saveTokens(data.accessToken, data.refreshToken)
  return data
}


