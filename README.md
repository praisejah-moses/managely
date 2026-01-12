# Project Management Application

A full-stack project management application built with Next.js and NestJS, featuring task management with dependencies, subtasks, and team collaboration.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with login/register functionality
- **Project Management**:
  - Create, view, and manage multiple projects
  - Real-time project search across names, descriptions, tasks, and people
  - Visual progress tracking with dynamic progress bars
  - Auto-calculation of project completion based on task status
- **Task Management**:
  - Add tasks to projects
  - Set task dependencies (tasks that must be completed before others)
  - Track task completion status with validation
  - Organize tasks by order
  - Loading animations during task status updates
  - Tasks cannot be marked complete until dependencies are satisfied
  - Tasks cannot be marked complete until all subtasks are finished
- **Subtask Management**:
  - Break down tasks into smaller subtasks
  - Full CRUD operations (Create, Read, Update, Delete)
  - Individual subtask completion tracking
  - Loading spinners during subtask operations
- **Team Collaboration**:
  - Add team members to projects
  - Display team member initials in avatars
  - Automatic duplicate prevention for people
- **Search & Filter**: Real-time project filtering by name, description, tasks, and team members
- **Loading States**: Individual loading indicators for each task and subtask operation
- **Responsive Design**: Beautiful UI built with Tailwind CSS and Shadcn
- **Data Seeding**: Comprehensive seeding script with 30 sample projects for testing

## 🛠️ Tech Stack

### Frontend (Client)

- **Framework**: Next.js 16.0.8 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend (Server)

- **Framework**: NestJS 11.0.1
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 7.1.0
- **Authentication**: JWT with Passport
- **Password Hashing**: bcryptjs
- **Validation**: class-validator, class-transformer
- **API Architecture**: RESTful with Bearer token authentication

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm**

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd praisejah-test-project
   ```

2. **Install dependencies** (Installs all node modules)

   ```bash
   npm install:all
   ```

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
   JWT_SECRET="your-secret-key-here"
   PORT=3001
   ```

4. **Run database migrations**

   ```bash
   cd server
   npx prisma migrate dev
   cd ..
   ```

5. **Seed the database (optional)**
   ```bash
   node seed-projects.js your-email@example.com your-password
   ```
   This will create 30 sample projects with tasks, subtasks, and team members. prisma migrate dev
   cd ..
   ```

   ```

## 🚀 Running the Application

### Option 1: Using Batch Script (Recommended for Windows)

```bash
.\start-dev.bat
```

This will open two separate terminal windows - one for the server and one for the client.

### Option 2: Using PowerShell Script

```bash
.\start-dev.ps1
```

This runs both in the same PowerShell window with color-coded output.

### Option 3: Using npm concurrently

```bash
npm run dev
```

This runs both server and client in one terminal with prefixed output, make sure to be in the ./praisejah-test-project directory

### Option 4: Manual Start (Two Separate Terminals)

**Terminal 1 - Server:**

```bash
cd server
npm run start:dev
```

Server will run on `http://localhost:3001`

**Terminal 2 - Client:**

```bash
cd client
npm run dev
```

Client will run on `http://localhost:3000`

## 📁 Project Structure

```# Modal for creating new projects
│   │   │   │   ├── ProjectDetailsModal.tsx     # Sticky header, task/subtask CRUD
│   │   │   │   ├── ProjectsCard.tsx            # Project card with progress bar
│   │   │   │   ├── Greeting.tsx                # User greeting component
│   │   │   │   └── Header.tsx                  # Search bar with user initials
│   │   │   ├── projectDetailsHandlers.ts       # Business logic for tasks/subtasks
│   │   │   ├── useDashboardState.ts            # Centralized state management
│   │   │   └── page.tsx                        # Main dashboard with search filter
│   │   ├── login/             # Login page
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Reusable UI components
│   │   └── ui/                # Shadcn components (button, card, input, etc.)
│   ├── lib/                   # Utility functions
│   │   ├── api.ts             # API client functions (auth, projects, tasks, subtasks)
│   │   ├── auth.ts            # Authentication utilities
│   │   └── utils.ts           # Helper functions
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Project, Task, Subtask, Person types
│   └── package.json
│
├── server/                    # NestJS backend application
│   ├── prisma/                # Prisma schema and migrations
│   │   ├── schema.prisma      # Database schema with all models
│   │   └── migrations/
│   │       └── 20251213075918_init/  # Initial migration
│   ├── generated/             # Prisma generated types
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/        # JWT auth guards
│   │   │   ├── decorators/    # Current user decorator
│   │   │   └── dto/           # Login/register DTOs
│   │   ├── projects/          # Projects module
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts    # Includes duplicate people prevention
│   │   │   └── dto/
│   │   ├── tasks/             # Tasks & Subtasks module
│   │   │   ├── tasks.controller.ts    # Task and subtask endpoints
│   │   │   ├── tasks.service.ts       # Validation logic for dependencies/subtasks
│   │   │   └── dto/
│   │   │       ├── create-task.dto.ts
│   │   │       ├── update-task.dto.ts
│   │   │       └── create-subtask.dto.ts
│   │   ├── users/             # Users module
│   │   ├── prisma/            # Prisma service
│   │   └── main.ts
│   └── package.json
│e application validates dependencies both client-side and server-side to ensure proper workflow sequencing. When you try to mark a task complete with incomplete dependencies, you'll receive a warning.

### Subtask Management
Each task can have multiple subtasks, allowing for better task breakdown and tracking of progress. Key features:
- **Full CRUD Operations**: Create, update, and delete subtasks
- **Completion Validation**: A task cannot be marked complete until all its subtasks are finished
- **Loading States**: Each subtask shows a loading spinner during operations
- **Server-side Validation**: The backend enforces subtask completion rules

### Project Search
The dashboard includes a powerful search feature that filters projects in real-time:
- Search by project name
- Search by project description
- Search by task names
- Search by team member names
- Case-insensitive matching

### Loading States & UX
Every asynchronous operation provides visual feedback:
- Individual loading spinners for each task and subtask
- Non-blocking operations (multiple items can be toggled independently)
- Smooth animations with Framer Motion
- Sticky modal headers for better navigation

### Projectasks/:id` - Update task (validates subtask completion)
- `DELETE /tasks/:id` - Delete task

### Subtasks
- `POST /tasks/:taskId/subtasks` - Add subtask to task
- `PATCH /tasks/subtasks/:subtaskId` - Update subtask
- `DELETE /tasks
│   └── package.json
│
├── start-dev.bat              # Windows batch script to start both
├── start-dev.ps1              # PowerShell script to start both
├── package.json               # Root package.json with concurrently
└── README.md
```

## 🔑 Key Features Explained

### Task Dependencies

Tasks can depend on other tasks, meaning they cannot be completed until their dependencies are finished. This ensures proper workflow sequencing.

### Subtasks

Each task can have multiple subtasks, allowing for better task breakdown and tracking of progress.

### Project Team

Add team members to projects to track who is involved. Team members can be assigned to specific tasks.

## 🌐 API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/verify` - Verify token

### Projects

- `GET /projects` - Get all projects
- `POST /projects` - Create a new project
- `GET /projects/:id` - Get project by ID
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Tasks (modal entry/exit, task toggles)

- **Gradient designs** for visual appeal (sticky headers, project cards)
- **Modal dialogs** with sticky headers for creating/editing projects
- **Progress tracking** with dynamic visual progress bars
- **Responsive design** for all screen sizes
- **Color-coded status indicators** for task completion
- **Loading spinners** for individual tasks and subtasks
- **Real-time search** with instant filtering
- **User avatars** with dynamic initials
- **Hidden scrollbars** for cleaner interface
- **Validation messages** when tasks can't be completed
- **Cancel buttons** for forms (subtask creation)Add subtask
- `PATCH /projects/:projectId/tasks/:taskId/subtasks/:subtaskId` - Update subtask
- `DELETE /projects/:projectId/tasks/:taskId/subtasks/:subtaskId` - Delete subtask

### People

- `POST /projects/:projectId/people` - Add person to project

## 🗄️ Database Schema

The application uses Prisma PostgreSQL with the following main entities:

- **Users**: Application users with authentication
- **Projects**: Projects created by users
- **Tasks**: Tasks within projects (with dependencies)
- **Subtasks**: Subtasks within tasks
- **Person**: People/team members
- **ProjectPeople**: Join table for project-person relationships
- **TaskAssignee**: Task assignments
- **TaskDependency**: Task dependencies

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. Users register/login through the auth endpoints
2. Server returns a JWT token
3. Token is stored in cookies and localStorage
4. Protected routes require valid JWT token
5. Token is verified on each request to protected endpoints

## 🎨 UI/UX Features

- \*🌱 Database Seeding

The project includes a comprehensive seeding script to populate your database with sample data for testing:

```bash
node seed-projects.js your-email@example.com your-password
```

**Features:**

- Creates 30 diverse projects (Website Redesign, Mobile App, E-commerce Platform, etc.)
- Adds realistic tasks with dependencies
- Includes team members and assignments
- Prevents duplicate people creation (reuses existing by email)
- Shows progress and statistics during seeding


## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in the `.env` file
- Run migrations: `npx prisma migrate dev`
- Verify database exists and user has proper permissions

### Port Already in Use

- Server default port: 3001
- Client default port: 3000
- Change ports in respective configuration files if needed

### Module Not Found Errors

- Run `npm install` in both client and server directories
- Clear node_modules and reinstall if issues persist
- Ensure you're using Node.js v18 or higher

### Task Completion Issues

- **Task won't complete**: Check if all dependencies are finished
- **Subtasks preventing completion**: Ensure all subtasks are marked complete
- **Loading spinner stuck**: Refresh the page and check server logs

### Seeding Script Issues

- **Authentication failed**: Verify email and password are correct
- **Duplicate people warnings**: This is normal; the script reuses existing people
- **Connection timeout**: Check if server is running on port 3001

# Client

cd client
npm run dev

````

### Build for production:
```bash
# Server
cd server
npm run build
npm run start:prod

# Client
cd client
npm run build
npm run start
````

### Run tests:

```bash
# Server
cd server
npm test
```

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in the `.env` file
- Run migrations: `npx prisma migrate dev`

### Port Already in Use

- Server default port: 3001
- Client default port: 3000
- Change ports in respective configuration files if needed

### Module Not Found Errors

- Run `npm install` in both client and server directories
- Clear node_modules and reinstall if issues persist

## 📄 License

This project is private and unlicensed.

## 👤 Author

PraiseJah Ossai

---

Built with ❤️ using Next.js and NestJS
