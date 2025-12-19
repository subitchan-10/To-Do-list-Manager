import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'
import Todo from './models/Todo.js'
import User from './models/User.js'
import { auth, adminAuth } from './middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err)
    console.log('Continuing without MongoDB connection...')
  })

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' })
})

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body
    const user = new User({ username, email, password, role: role || 'user' })
    await user.save()
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.status(201).json({ token, user: { id: user._id, username, email, role: user.role } })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.json({ token, user: { id: user._id, username: user.username, email, role: user.role } })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get todos (user sees only their todos, admin sees all)
app.get('/api/todos', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id }
    const todos = await Todo.find(filter).populate('user', 'username email').sort({ createdAt: -1 })
    res.json(todos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Admin route to get all users and their todos
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password')
    const usersWithTodos = await Promise.all(
      users.map(async (user) => {
        const todos = await Todo.find({ user: user._id })
        return { ...user.toObject(), todos }
      })
    )
    res.json(usersWithTodos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create todo
app.post('/api/todos', auth, async (req, res) => {
  try {
    const todo = new Todo({ ...req.body, user: req.user._id })
    const savedTodo = await todo.save()
    res.status(201).json(savedTodo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update todo
app.put('/api/todos/:id', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id }
    const todo = await Todo.findOneAndUpdate(filter, req.body, { new: true })
    if (!todo) return res.status(404).json({ error: 'Todo not found' })
    res.json(todo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete todo
app.delete('/api/todos/:id', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id }
    const todo = await Todo.findOneAndDelete(filter)
    if (!todo) return res.status(404).json({ error: 'Todo not found' })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')))

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../client/dist/index.html')
  try {
    res.sendFile(indexPath)
  } catch (error) {
    res.status(404).json({ error: 'Frontend build not found. Run: cd client && npm run build' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Test the server at: http://localhost:${PORT}/api/test`)
})