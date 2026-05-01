import axios from 'axios'
import type { LoginRequest, LoginResponse } from '@rahuldey98/alqamar-models/dist/auth/login'
import { getAccessToken } from '../utils/auth.ts'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

export const login = async ({ phone, password }: LoginRequest) => {
  const { data } = await api.post<LoginResponse>('auth/login', { phone, password })
  return data
}
