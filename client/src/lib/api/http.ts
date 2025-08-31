import axios, { type AxiosInstance } from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, isTokenExpired, saveTokens } from '../utils/auth'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

const baseURL = import.meta.env.VITE_API_URL as string

export function createHttpClient(): AxiosInstance {
  const instance = axios.create({ baseURL, withCredentials: false })
  instance.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  instance.interceptors.response.use(
    (r) => r,
    async (error) => {
      const original = error?.config
      if (!original || original.__isRetryRequest) {
        return Promise.reject(error)
      }
      const urlPath: string = (original.url || '') as string
      if (urlPath.startsWith('/auth/login') || urlPath.startsWith('/auth/refresh')) {
        return Promise.reject(error)
      }
      if (error?.response?.status === 401) {
        const refreshToken = getRefreshToken()
        if (!refreshToken || isTokenExpired(refreshToken)) {
          clearTokens()
          return Promise.reject(error)
        }
        try {
          original.__isRetryRequest = true
          const { data } = await instance.post<LoginResponse>('/auth/refresh')
          saveTokens(data.accessToken, data.refreshToken)
          original.headers = original.headers ?? {}
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return instance.request(original)
        } catch (e) {
          clearTokens()
          return Promise.reject(e)
        }
      }
      return Promise.reject(error)
    },
  )
  return instance
}

export const api = createHttpClient()


