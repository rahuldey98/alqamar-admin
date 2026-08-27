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

export const resetPassword = async (id: number, password: string): Promise<void> => {
  await api.patch<ApiSuccessResponse<unknown>>(`users/${id}`, { password })
}

export interface CourseListItem extends Course {
  durationMonths: number
  status: 'ACTIVE' | 'INACTIVE'
}

export const getCourses = async (): Promise<CourseListItem[]> => {
  const { data } = await api.get<ApiSuccessResponse<CourseListItem[]>>('courses')
  return data.data
}

interface CreateCourseRequest {
  title: string
  enTitle: string
  durationMonths: number
}

export const createCourse = async (body: CreateCourseRequest): Promise<CourseListItem> => {
  const { data } = await api.post<ApiSuccessResponse<CourseListItem>>('courses', body)
  return data.data
}

// ── Daily Ad-Hoc Classes (class_v2) ──────────────────────────────────────────

export const UserRole = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const ClassAttendanceStatus = {
  PENDING: 'PENDING',
  TEACHER_PRESENT: 'TEACHER_PRESENT',
  STUDENT_PRESENT: 'STUDENT_PRESENT',
  ALL_PRESENT: 'ALL_PRESENT',
  ABSENT: 'ABSENT',
} as const
export type ClassAttendanceStatus = (typeof ClassAttendanceStatus)[keyof typeof ClassAttendanceStatus]

export interface UserPublicProfile {
  id: number
  name: string
  phone: string
  email?: string | null
  role: UserRole
  gender?: 'MALE' | 'FEMALE' | null
  meetLink?: string | null
}

export interface ClassV2Item {
  id: number
  date: string
  startTime: string
  endTime: string
  isOngoing?: boolean
  meetLink?: string | null
  teacher: {
    id: number
    name: string
    phone?: string
  }
  student: {
    id: number
    name: string
    phone?: string
    course?: string | null
  }
  attendance: {
    status: ClassAttendanceStatus
    teacherAttended: boolean
    studentAttended: boolean
    teacherJoinedAt: string | null
    studentJoinedAt: string | null
  }
}

export interface AttendancePersonRecord {
  id: number
  name: string
  attended: boolean
  joinedAt: string | null
}

export interface AttendanceClassRecord {
  classId: number
  courseTitle: string | null
  startTime: string
  endTime: string
  attendanceStatus: ClassAttendanceStatus | string
  teacher: AttendancePersonRecord
  student: AttendancePersonRecord
}

export interface AttendanceByDateResponse {
  date: string
  timezone: string
  totalClasses: number
  classes: AttendanceClassRecord[]
}

// Backwards compatibility alias
export type ClassAttendance = AttendanceClassRecord

export const getAttendanceRecords = async (date?: string): Promise<AttendanceByDateResponse> => {
  const { data } = await api.get<ApiSuccessResponse<AttendanceByDateResponse>>('classes-v2/attendance', {
    params: date ? { date } : undefined,
  })
  return data.data
}

export const getClassesAttendance = async (date?: string): Promise<AttendanceClassRecord[]> => {
  const res = await getAttendanceRecords(date)
  return res?.classes ?? []
}

export const getActiveUpcomingClasses = async (): Promise<ClassV2Item[]> => {
  const { data } = await api.get<ApiSuccessResponse<ClassV2Item[]>>('classes-v2')
  return data.data
}

