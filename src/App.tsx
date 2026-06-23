import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getAccessToken } from './utils/auth.ts'
import { HomePage } from './pages/home.tsx'
import { LoginPage } from './pages/login.tsx'
import { TeachersPage } from './pages/teachers.tsx'
import { StudentsPage } from './pages/students.tsx'
import { AttendancePage } from './pages/attendance.tsx'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getAccessToken()) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  if (getAccessToken()) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={getAccessToken() ? '/home' : '/login'} replace />}
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <TeachersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
