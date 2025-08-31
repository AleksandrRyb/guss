export interface JwtPayload {
  exp?: number
  iat?: number
  [key: string]: unknown
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  try {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  } catch {}
}

export function clearTokens(): void {
  try {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  } catch {}
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true
  }
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) {
    return true
  }
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payloadB64] = token.split('.')
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json))) as JwtPayload
  } catch {
    return null
  }
}

export interface CurrentUser {
  sub: string
  username?: string
  role?: string
}

export function getCurrentUser(): CurrentUser | null {
  const token = getAccessToken()
  if (!token || isTokenExpired(token)) {
    return null
  }
  const payload = decodeJwtPayload(token)
  if (!payload) {
    return null
  }
  const { sub, username, role } = payload as any
  return { sub: String(sub), username: username as string | undefined, role: role as string | undefined }
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

export function isAuthenticated(): boolean {
  const access = getAccessToken()
  if (access && !isTokenExpired(access)) {
    return true
  }
  return false
}


