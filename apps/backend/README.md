# Backend API - Express.js Guide 🚀

This document explains the Express.js backend architecture for developers familiar with frontend but new to backend development.

## 🏗️ Architecture Overview

The backend follows a **layered architecture** pattern, similar to how you might organize components in React:

```
Frontend (React)           Backend (Express)
├── Components              ├── Routes (API endpoints)
├── Hooks                   ├── Middleware (request processing)
├── Utils                   ├── Services (business logic)
└── API calls               └── Database (data persistence)
```

## 📁 Project Structure

```
apps/backend/
├── src/
│   ├── index.ts           # App entry point (like App.tsx)
│   ├── routes/            # API endpoints (like pages/)
│   │   ├── events.ts      # /api/events endpoints
│   │   ├── watchlists.ts  # /api/watchlists endpoints
│   │   └── health.ts      # /health endpoint
│   ├── middleware/        # Request processors
│   │   ├── correlation.ts # Adds tracking IDs
│   │   ├── errorHandler.ts# Error handling
│   │   └── requestLogger.ts# Logging
│   ├── services/          # Business logic
│   │   └── aiService.ts   # OpenAI integration
│   └── utils/             # Utilities
│       └── logger.ts      # Structured logging
├── package.json
└── tsconfig.json
```

## 🔄 Request Flow

Think of each request like a React component lifecycle:

```
1. Request arrives → middleware/correlation.ts (adds tracking ID)
2. Logging → middleware/requestLogger.ts (logs request details)
3. Routing → routes/*.ts (like routing in Next.js)
4. Validation → Zod schemas (like PropTypes)
5. Business Logic → services/*.ts (like custom hooks)
6. Database → Prisma ORM (like API calls)
7. Response → JSON (like component return)
8. Error Handling → middleware/errorHandler.ts (like error boundaries)
```

## 📍 Routes (API Endpoints)

Routes in Express are like pages in Next.js, but they return JSON instead of HTML:

### Basic Route Structure

```typescript
// Similar to Next.js API route
router.get("/api/events", async (req: Request, res: Response) => {
  // 1. Get data from request (like props)
  const { watchlistId } = req.query;

  // 2. Business logic (like component logic)
  const events = await prisma.event.findMany({
    where: watchlistId ? { watchlistId } : {},
  });

  // 3. Return response (like JSX)
  res.json({
    success: true,
    data: events,
  });
});
```

### Route Methods (HTTP Verbs)

```typescript
// GET - Read data (like fetching in useEffect)
router.get("/api/events", getAllEvents);

// POST - Create data (like form submission)
router.post("/api/events", createEvent);

// PUT - Update data (like editing a form)
router.put("/api/events/:id", updateEvent);

// DELETE - Remove data (like delete button)
router.delete("/api/events/:id", deleteEvent);
```

## 🔧 Middleware (Request Processors)

Middleware in Express is like React's Higher-Order Components (HOCs) - they wrap around your routes:

### Correlation Middleware

```typescript
// Adds a unique ID to track requests (like React's key prop)
export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = uuidv4();
  (req as any).correlationId = correlationId;
  res.setHeader("X-Correlation-ID", correlationId);
  next(); // Continue to next middleware/route
};
```

### Request Logger

```typescript
// Logs all requests (like React DevTools)
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info("Request completed", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};
```

### Error Handler

```typescript
// Catches all errors (like React Error Boundary)
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Request failed", { error: err.message });

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
};
```

## 🎯 Services (Business Logic)

Services contain business logic, similar to custom React hooks:

### AI Service Example

```typescript
class AIService {
  // Like a custom hook for API calls
  async analyzeEvent(
    type: string,
    description: string,
    metadata: any,
    terms: string[]
  ) {
    // Business logic here
    const prompt = this.buildPrompt(type, description, metadata, terms);

    if (this.hasOpenAIKey()) {
      // Real AI analysis
      return await this.callOpenAI(prompt);
    } else {
      // Mock response for development
      return this.getMockResponse();
    }
  }

  private buildPrompt(
    type: string,
    description: string,
    metadata: any,
    terms: string[]
  ) {
    // Construct AI prompt
    return `Analyze this security event...`;
  }
}
```

## 🗄️ Database Integration

Prisma ORM works like a type-safe API client:

### Database Operations

```typescript
// Like React Query or SWR, but for database
const events = await prisma.event.findMany({
  where: { watchlistId },
  include: { watchlist: true }, // Like joining tables
  orderBy: { createdAt: "desc" },
});

// Create (like POST request)
const newEvent = await prisma.event.create({
  data: {
    type,
    description,
    metadata: JSON.stringify(metadata),
    watchlistId,
  },
});

// Update (like PUT request)
const updatedEvent = await prisma.event.update({
  where: { id },
  data: { aiSeverity: "HIGH" },
});
```

## 🛡️ Validation & Type Safety

Using Zod for validation (like PropTypes but at runtime):

```typescript
// Define schema (like TypeScript interfaces)
const CreateEventSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  watchlistId: z.string().uuid(),
});

// Validate in route (like validating props)
router.post("/api/events", async (req: Request, res: Response) => {
  const validation = CreateEventSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request data",
      details: validation.error.errors,
    });
  }

  // Use validated data
  const { type, description, metadata, watchlistId } = validation.data;
  // ... rest of the logic
});
```

## 📊 Logging & Monitoring

Structured logging helps debug issues (like React DevTools):

```typescript
// Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }),
  ],
});

// Usage in routes
logger.info("Event created", {
  eventId: event.id,
  watchlistId,
  correlationId: (req as any).correlationId,
});
```

## 🚦 Error Handling

Express error handling is like React Error Boundaries:

```typescript
// Custom error class
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Usage in routes
if (!watchlistId) {
  throw new AppError("Watchlist ID is required", 400);
}

// Global error handler catches all
app.use(errorHandler);
```

## 🔌 API Documentation

Using Swagger/OpenAPI for documentation (like Storybook for APIs):

```typescript
/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all security events
 *     parameters:
 *       - name: watchlistId
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/api/events", getAllEvents);
```

## 🏃‍♂️ Development Workflow

### Starting the Server

```bash
# Development (auto-restart on changes)
pnpm dev

# Production build
pnpm build
pnpm start
```

### Testing APIs

```bash
# Health check
curl http://localhost:3001/health

# Get events
curl http://localhost:3001/api/events

# Create event
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "description": "Test event", "watchlistId": "uuid"}'
```

## 🔍 Debugging Tips

1. **Use correlation IDs** - Track requests across logs
2. **Check logs** - Structured logging shows request flow
3. **Validate schemas** - Zod provides clear error messages
4. **Use API docs** - Swagger UI at `/api-docs`
5. **Monitor database** - Prisma Studio for data inspection

## 🚀 Key Concepts for Frontend Developers

| Frontend Concept | Backend Equivalent  | Purpose                       |
| ---------------- | ------------------- | ----------------------------- |
| Components       | Routes              | Handle specific functionality |
| Props            | Request body/params | Input data                    |
| State            | Database            | Data persistence              |
| useEffect        | Middleware          | Side effects and processing   |
| Custom hooks     | Services            | Reusable business logic       |
| Error boundaries | Error handlers      | Centralized error handling    |
| DevTools         | Logging             | Debugging and monitoring      |

## 📚 Next Steps

1. **Explore the code** - Start with `src/index.ts`
2. **Check routes** - See how APIs are structured
3. **Test endpoints** - Use Postman or curl
4. **Read logs** - Understand request flow
5. **Modify and experiment** - Add new endpoints

The backend is designed to be familiar to frontend developers while following Express.js best practices!
