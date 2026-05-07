# Team Task Manager

A full-stack, role-based Team Task Manager built with React, Node.js, Express, and MongoDB.

## Features
- **Authentication**: JWT-based login and signup.
- **Role-Based Access Control**:
  - **Admin**: Create projects, assign tasks, manage members, delete projects/tasks, update all task fields.
  - **Member**: View assigned tasks, update task status (Todo → In Progress → Completed).
- **Projects**: Group tasks logically, assign team members.
- **Tasks**: Title, description, status, priority, due dates, overdue tracking.
- **Dashboard**: High-level task statistics and recent tasks overview.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Axios, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs.

## Directory Structure
- `/backend`: Node.js + Express API.
- `/frontend`: React + Vite Frontend.

---

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Database URI (e.g., MongoDB Atlas)

---

## 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Open `backend/.env` file.
   - Set your `MONGO_URI` to a valid MongoDB connection string.
   - Set your `JWT_SECRET` to a secure random string.
   - Note: I've provided a placeholder `MONGO_URI` in `.env`. You **MUST** replace it with your actual MongoDB URI for the backend to start successfully.

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will run on http://localhost:5000*

---

## 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at http://localhost:5173*

---

## 3. Usage Guide

1. **Sign Up**: Start by creating a new account. Select the **Admin** role to get full access.
2. **Create Project**: Go to "Projects" and create a project.
3. **Add Members**: Have other users sign up (as **Member**), then add them to your project via the "Edit" button on the project card.
4. **Create Tasks**: Go to "Tasks" (or use the "New Task" button) to assign tasks to members in a project.
5. **Manage Tasks**: 
   - Admins can edit/delete any tasks.
   - Members can only update the status of tasks assigned to them.
