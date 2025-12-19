# MERN Todo App with Authentication

A full-stack todo list application with user authentication and role-based access control.

## Project Structure
```
todo-app/
├── client/          # React frontend
├── server/          # Express backend
└── package.json     # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running

### Quick Start
1. Install all dependencies:
   ```bash
   npm run install-all
   ```

2. Start both client and server:
   ```bash
   npm run dev
   ```

### Manual Setup

#### Backend Setup
1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file with:
   ```
   MONGODB_URI=mongodb://localhost:27017/todoapp
   JWT_SECRET=your-secret-key
   PORT=8000
   ```

4. Run the server:
   ```bash
   npm run dev
   ```

#### Frontend Setup
1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Features
- **Authentication**: User registration and login
- **Role-based Access**: User and Admin roles
- **Todo Management**: Add, edit, delete, and mark todos as complete
- **Priority System**: High, Medium, Low priority levels
- **Due Dates**: Set and track due dates
- **Search & Filter**: Search todos and filter by status
- **Admin Dashboard**: View all users and their activities
- **Responsive UI**: Clean design with Tailwind CSS

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express, JWT Authentication
- **Database**: MongoDB with Mongoose
- **Authentication**: bcryptjs for password hashing

## User Roles
- **User**: Can create, edit, and delete their own todos
- **Admin**: Can view all users' todos and manage user activities