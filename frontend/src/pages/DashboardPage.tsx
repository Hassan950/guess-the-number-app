import { useAuth } from '../context/useAuth'

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="page">
      <header className="page-header">
        <span>{user?.email}</span>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </header>
      <p>Game coming soon.</p>
    </div>
  )
}
