import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Still loading auth session
  if (loading) return <Spinner />

  // Not logged in
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />

  // Admin route: wait for profile to load before deciding
  if (adminOnly) {
    // Profile not yet fetched — keep showing spinner
    if (profile === null) return <Spinner />
    // Profile loaded but not admin
    if (!profile.is_admin) return <Navigate to="/" replace />
  }

  return <>{children}</>
}
