import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TodoApp = () => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchTodos()
    if (user.role === 'admin') {
      fetchUsers()
    }
  }, [user])

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/todos`)
      setTodos(response.data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`)
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    
    try {
      const response = await axios.post(`${API_URL}/api/todos`, {
        text: newTodo,
        priority,
        dueTime: dueTime || undefined
      })
      setTodos([response.data, ...todos])
      setNewTodo('')
      setDueTime('')
      setPriority('medium')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t._id === id)
      const response = await axios.put(`${API_URL}/api/todos/${id}`, {
        completed: !todo.completed
      })
      setTodos(todos.map(t => t._id === id ? response.data : t))
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/todos/${id}`)
      setTodos(todos.filter(t => t._id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const editTodo = async (id, newText) => {
    if (!newText.trim()) return
    try {
      const response = await axios.put(`${API_URL}/api/todos/${id}`, {
        text: newText
      })
      setTodos(todos.map(t => t._id === id ? response.data : t))
      setEditingId(null)
      setEditText('')
    } catch (error) {
      console.error('Error editing todo:', error)
    }
  }

  const filteredTodos = todos
    .filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      if (filter === 'active') return !todo.completed && matchesSearch
      if (filter === 'completed') return todo.completed && matchesSearch
      return matchesSearch
    })
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const isOverdue = (dueTime) => {
    if (!dueTime) return false
    return new Date(dueTime) < new Date()
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const activeTodos = todos.filter(t => !t.completed).length
  const completedTodos = todos.filter(t => t.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Todo List</h1>
              <p className="text-gray-600">Welcome, {user.username} ({user.role})</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          
          <p className="text-center text-gray-600 mb-6">{activeTodos} active, {completedTodos} completed</p>
          
          <form onSubmit={addTodo} className="mb-6">
            <div className="space-y-3">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </form>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search todos..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Active ({activeTodos})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Completed ({completedTodos})
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTodos.map((todo) => (
              <div key={todo._id} className={`p-3 border rounded-lg ${todo.completed ? 'bg-gray-50' : isOverdue(todo.dueTime) ? 'bg-red-50' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo._id)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  {editingId === todo._id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => editTodo(todo._id, editText)}
                      onKeyPress={(e) => e.key === 'Enter' && editTodo(todo._id, editText)}
                      className="flex-1 px-2 py-1 border rounded"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className={`flex-1 cursor-pointer ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                      onDoubleClick={() => {
                        setEditingId(todo._id)
                        setEditText(todo.text)
                      }}
                    >
                      {todo.text}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>
                  {user.role === 'admin' && todo.user && (
                    <span className="text-xs text-gray-500">by {todo.user.username}</span>
                  )}
                  <button
                    onClick={() => {
                      setEditingId(todo._id)
                      setEditText(todo.text)
                    }}
                    className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo._id)}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
                {todo.dueTime && (
                  <div className={`mt-2 text-sm ${isOverdue(todo.dueTime) ? 'text-red-600' : 'text-gray-600'}`}>
                    Due: {new Date(todo.dueTime).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">User Management</h2>
            <div className="space-y-4">
              {users.map((userData) => (
                <div key={userData._id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{userData.username} ({userData.email})</h3>
                  <p className="text-sm text-gray-600">Todos: {userData.todos.length}</p>
                  <div className="mt-2 space-y-1">
                    {userData.todos.slice(0, 3).map((todo) => (
                      <div key={todo._id} className="text-sm text-gray-700">
                        • {todo.text} {todo.completed ? '✓' : ''}
                      </div>
                    ))}
                    {userData.todos.length > 3 && (
                      <div className="text-sm text-gray-500">...and {userData.todos.length - 3} more</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TodoApp