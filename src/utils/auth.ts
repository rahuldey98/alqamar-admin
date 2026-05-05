import type { UserResponse } from '@rahuldey98/alqamar-models'

const ACCESS_TOKEN_KEY = 'alqamar_access_token'
const USER_KEY = 'alqamar_user'

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)

export const setAccessToken = (accessToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export const getUser = (): UserResponse | null => {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as UserResponse) : null
}

export const setUser = (user: UserResponse) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
