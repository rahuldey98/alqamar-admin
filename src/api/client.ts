import axios from 'axios'
import type { LoginRequest, LoginResponse, ApiSuccessResponse, User, GetStudentResponse, DashboardOverview, CreateUserRequest, CreateUserResponse, UpdateUserRequest, UpdateUserResponse } from '@rahuldey98/alqamar-models'
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
  const { data } = await api.post<ApiSuccessResponse<LoginResponse>>('auth/login', { phone, password })
  return data
}

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const { data } = await api.get<ApiSuccessResponse<DashboardOverview>>('dashboard/overview')
  return data.data
}


export const getTeachers = async (): Promise<User[]> => {
  const { data } = await api.get<ApiSuccessResponse<User[]>>('users/teachers')
  return data.data
}


export const getStudents = async (): Promise<GetStudentResponse[]> => {
  const { data } = await api.get<ApiSuccessResponse<GetStudentResponse[]>>('users/students')
  return data.data
}

export const createUser = async (body: CreateUserRequest): Promise<CreateUserResponse> => {
  const { data } = await api.post<ApiSuccessResponse<CreateUserResponse>>('users', body)
  return data.data
}

export const updateUser = async (id: number, body: UpdateUserRequest): Promise<UpdateUserResponse> => {
  const { data } = await api.patch<ApiSuccessResponse<UpdateUserResponse>>(`users/${id}`, body)
  return data.data
}
