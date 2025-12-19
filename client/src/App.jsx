import { useAuth } from './context/AuthContext'
import Auth from './components/Auth'
import TodoApp from './components/TodoApp'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return user ? <TodoApp /> : <Auth />
}

export default App