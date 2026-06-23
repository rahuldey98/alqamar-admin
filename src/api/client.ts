import axios from 'axios'
import type { LoginRequest, LoginResponse, ApiSuccessResponse, DashboardOverview, CreateUserRequest, Course, Student, Teacher } from '@rahuldey98/alqamar-models'
import { getAccessToken } from '../utils/auth.ts'

export const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : 'https://api.alqamarquraanacademy.com',
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

export const getTeachers = async (): Promise<Teacher[]> => {
  const { data } = await api.get<ApiSuccessResponse<Teacher[]>>('users/teachers')
  return data.data
}

export const getTeacherStudents = async (id: number): Promise<Student[]> => {
  const { data } = await api.get<ApiSuccessResponse<Student[]>>(`users/teachers/${id}/students`)
  return data.data
}

export const getStudents = async (): Promise<Student[]> => {
  const { data } = await api.get<ApiSuccessResponse<Student[]>>('users/students')
  return data.data
}

type CreateTeacherRequest = Omit<CreateUserRequest, 'role'>

interface CreateStudentRequest extends Omit<CreateUserRequest, 'role'> {
  feesDate?: string
  courseId?: number
  teacherId?: number
}

export const createTeacher = async (body: CreateTeacherRequest): Promise<Teacher> => {
  const { data } = await api.post<ApiSuccessResponse<Teacher>>('users/teachers', body)
  return data.data
}

export const updateTeacher = async (id: number, body: Partial<Teacher>): Promise<Teacher> => {
  const { data } = await api.patch<ApiSuccessResponse<Teacher>>(`users/teachers/${id}`, body)
  return data.data
}

export const createStudent = async (body: CreateStudentRequest): Promise<Student> => {
  const { data } = await api.post<ApiSuccessResponse<Student>>('users/students', body)
  return data.data
}

export const updateStudent = async (id: number, body: Partial<Student>): Promise<Student> => {
  const { data } = await api.patch<ApiSuccessResponse<Student>>(`users/students/${id}`, body)
  return data.data
}

export const getCourses = async (): Promise<Course[]> => {
  const { data } = await api.get<ApiSuccessResponse<Course[]>>('courses')
  return data.data
}

export interface ClassAttendance {
  classId: number
  className: string | null
  teacherName: string | null
  studentName: string | null
  date: string
  startTime: string
  endTime: string
  attendanceStatus: string
}

export const getClassesAttendance = async (date: string): Promise<ClassAttendance[]> => {
  const { data } = await api.get<ApiSuccessResponse<ClassAttendance[]>>('classes/attendance', { params: { date } })
  return data.data
}
