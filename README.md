# Signal Watcher 🛡️

AI-powered security monitoring platform built with Next.js and Express.js for real-time threat detection and analysis.

![Architecture](https://img.shields.io/badge/Architecture-Full%20Stack-blue)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![Backend](https://img.shields.io/badge/Backend-Express.js-green)
![Database](https://img.shields.io/badge/Database-SQLite%20%2B%20Prisma-orange)
![AI](https://img.shields.io/badge/AI-OpenAI%20GPT--4-purple)

## 🏗️ Architecture Overview

### Backend (Node.js + Express + TypeScript)

- **API Layer**: RESTful APIs with Express.js and TypeScript
- **Database**: SQLite with Prisma ORM for development simplicity
- **AI Integration**: OpenAI GPT-4 for intelligent event analysis
- **Middleware**: Correlation IDs, request logging, error handling
- **Validation**: Zod schemas for type-safe request validation

### Frontend (Next.js 14 + React)

- **Framework**: Next.js 14 with App Router (no src folder)
- **UI Components**: shadcn/ui + Tailwind CSS for modern design
- **State Management**: React hooks with client-side API calls
- **TypeScript**: Full type safety across the application

### Database Schema

- **Watchlists**: User-defined monitoring rules with search terms
- **Events**: Security incidents with AI analysis and metadata
- **AI Analysis**: Severity assessment and suggested actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)

### Installation & Setup

1. **Clone and install dependencies:**

```bash
git clone <repo-url>
cd signal-watcher
pnpm install
```

2. **Setup database:**

```bash
pnpm run db:setup
```

3. **Start development servers:**

```bash
pnpm dev
```

This starts:

- 🖥️ **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:3001
- 📚 **API Documentation**: http://localhost:3001/api-docs

## ✨ Features

### Core Functionality

- ✅ **Watchlist Management**: Create monitoring rules with custom search terms
- ✅ **Event Simulation**: Generate realistic security events for testing
- ✅ **AI Analysis**: Automated threat assessment with OpenAI integration
- ✅ **Severity Classification**: LOW/MED/HIGH/CRITICAL threat levels
- ✅ **Action Suggestions**: AI-powered response recommendations

### Technical Features

- ✅ **RESTful APIs**: OpenAPI/Swagger documentation
- ✅ **Type Safety**: End-to-end TypeScript coverage
- ✅ **Request Tracing**: Correlation IDs for debugging
- ✅ **Error Handling**: Structured error responses
- ✅ **Validation**: Schema-based request validation
- ✅ **Responsive UI**: Mobile-friendly interface

## 📁 Project Structure

```
signal-watcher/
├── apps/
│   ├── backend/              # Express.js API Server
│   │   ├── src/
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── services/     # Business logic
│   │   │   └── utils/        # Utilities
│   │   └── package.json
│   └── frontend/             # Next.js Application
│       ├── app/              # App Router pages
│       ├── components/       # React components
│       ├── lib/              # Client utilities
│       └── package.json
├── packages/
│   ├── shared/               # Shared types and schemas
│   └── database/             # Prisma schema and client
├── docs/                     # Documentation
└── package.json              # Root workspace config
```

## 🔧 Development Guide

### Backend Architecture (Express.js)

The backend follows a layered architecture pattern:

1. **Routes Layer** (`apps/backend/src/routes/`)

   - API endpoints with OpenAPI documentation
   - Request validation and response handling

2. **Middleware Layer** (`apps/backend/src/middleware/`)

   - Correlation ID tracking
   - Request logging
   - Error handling

3. **Services Layer** (`apps/backend/src/services/`)

   - Business logic
   - AI integration
   - External API calls

4. **Database Layer** (`packages/database/`)
   - Prisma schema and migrations
   - Type-safe database operations

### Frontend Architecture (Next.js)

The frontend uses Next.js 14 App Router:

1. **Pages** (`apps/frontend/app/`)

   - Server and client components
   - App Router file-based routing

2. **Components** (`apps/frontend/components/`)

   - Reusable UI components with shadcn/ui
   - Form handling and state management

3. **API Client** (`apps/frontend/lib/api.ts`)
   - Type-safe API calls
   - Error handling and response parsing

## 📚 API Documentation

### Main Endpoints

#### Watchlists

- `GET /api/watchlists` - List all watchlists
- `POST /api/watchlists` - Create new watchlist
- `PUT /api/watchlists/:id` - Update watchlist
- `DELETE /api/watchlists/:id` - Delete watchlist

#### Events

- `GET /api/events` - List security events
- `POST /api/events` - Create new event
- `POST /api/events/simulate` - Simulate events for testing

#### System

- `GET /health` - Health check with system status

Visit http://localhost:3001/api-docs for interactive API documentation.

## 🤖 AI Integration

The application integrates with OpenAI GPT-4 for intelligent security analysis:

### Features

- **Event Analysis**: Automatic threat assessment
- **Severity Classification**: Smart risk scoring
- **Action Suggestions**: Recommended response strategies
- **Mock Mode**: Fallback for development without API keys

### Configuration

```typescript
// AI Service automatically detects OpenAI API key
// Falls back to mock responses for development
const aiService = new AIService();
```

## 🛠️ Available Scripts

### Root Level

- `pnpm dev` - Start both frontend and backend
- `pnpm build` - Build all packages
- `pnpm db:setup` - Initialize database

### Backend Specific

- `pnpm --filter @signal-watcher/backend dev` - Start API server
- `pnpm --filter @signal-watcher/backend build` - Build backend
- `pnpm --filter @signal-watcher/backend test` - Run tests

### Frontend Specific

- `pnpm --filter @signal-watcher/frontend dev` - Start Next.js app
- `pnpm --filter @signal-watcher/frontend build` - Build frontend

### Database

- `pnpm --filter @signal-watcher/database db:generate` - Generate Prisma client
- `pnpm --filter @signal-watcher/database db:migrate` - Run migrations
- `pnpm --filter @signal-watcher/database db:studio` - Open Prisma Studio

## 🔍 How It Works

1. **Create Watchlists**: Define monitoring rules with search terms
2. **Event Detection**: Events are created manually or via simulation
3. **AI Analysis**: OpenAI analyzes events against watchlist terms
4. **Classification**: Events are categorized by severity and risk
5. **Response**: Suggested actions help with incident response

## 📖 Learn More

- [Backend Guide](./apps/backend/README.md) - Detailed Express.js architecture
- [Frontend Guide](./apps/frontend/README.md) - Next.js development guide
- [Database Schema](./packages/database/README.md) - Prisma setup and models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
