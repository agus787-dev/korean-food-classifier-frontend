import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { AdminRoute } from './auth/AdminRoute'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { AdminLayout } from './components/admin/AdminLayout'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { HomePage } from './pages/HomePage'
import { HistoryPage } from './pages/HistoryPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PredictPage } from './pages/PredictPage'
import { ProfilePage } from './pages/ProfilePage'

const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })),
)
const AdminUsersPage = lazy(() =>
  import('./pages/admin/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })),
)
const AdminPredictionsPage = lazy(() =>
  import('./pages/admin/AdminPredictionsPage').then((module) => ({ default: module.AdminPredictionsPage })),
)
const AdminFeedbackPage = lazy(() =>
  import('./pages/admin/AdminFeedbackPage').then((module) => ({ default: module.AdminFeedbackPage })),
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="predict" element={<PredictPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Suspense fallback={<p role="status" className="text-sm text-muted">Loading dashboard…</p>}><AdminDashboardPage /></Suspense>} />
                <Route path="users" element={<Suspense fallback={<p role="status" className="text-sm text-muted">Loading users…</p>}><AdminUsersPage /></Suspense>} />
                <Route path="predictions" element={<Suspense fallback={<p role="status" className="text-sm text-muted">Loading predictions…</p>}><AdminPredictionsPage /></Suspense>} />
                <Route path="feedback" element={<Suspense fallback={<p role="status" className="text-sm text-muted">Loading feedback…</p>}><AdminFeedbackPage /></Suspense>} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
