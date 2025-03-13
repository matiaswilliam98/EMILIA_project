# EMILIA Project

An intelligent personal assistant featuring a web application with integrated AI capabilities for enhanced productivity.

## Project Overview

EMILIA (Enhanced Machine Intelligence for Life and Individual Assistant) is a project that combines a modern web application with AI-powered features to help users manage tasks, schedule events, and communicate effectively.

## Architecture

The project is structured into three main components:

### Frontend (React + Vite)
- Modern, responsive UI built with React and Vite
- Component-based architecture for maximum reusability
- Secure authentication with protected routes
- Features include:
  - Dashboard for overview and navigation
  - Chat interface with AI assistant
  - Calendar for scheduling and reminders
  - Todo list for task management

### Backend (Express + TypeScript + Prisma)
- RESTful API built with Express and TypeScript
- Secure authentication with JWT tokens
- PostgreSQL database with Prisma ORM for data management
- Features include:
  - User authentication (register, login, logout)
  - Data persistence for user information

### AI (Python)
- Advanced AI capabilities using LangGraph architecture
- Agent-based system for intelligent assistance
- Tools for enhancing productivity and automation

## Technology Stack

### Frontend
- React 18
- Vite 6
- React Router 7
- Chakra UI 3
- Tailwind CSS 4
- Axios for API communication

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JSON Web Token (JWT) for authentication
- bcrypt for password hashing

### AI Component
- Python
- LangGraph for agent workflows
- Custom prompts and tools for enhanced capabilities

## Getting Started

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend
```bash
cd Backend
npm install
npx prisma migrate dev
npm run dev
```

### AI Component
```bash
cd AI
# Setup instructions for AI component
```

## Integration
- Frontend communicates with Backend via RESTful API endpoints
- Authentication is handled with JWT tokens
- Protected routes ensure secure access to application features
- AI component integrates with the application to provide intelligent assistance
