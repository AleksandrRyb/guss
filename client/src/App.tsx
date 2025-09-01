import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/login'
import { HomePage } from './pages/home'
import { isAuthenticated } from './lib/utils/auth'
import { RoundPage } from './pages/round'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/round/:id"
          element={
            <PrivateRoute>
              <RoundPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
