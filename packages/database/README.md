# Database Package - Prisma & SQLite 🗄️

This document explains the database setup with Prisma ORM and SQLite for the Signal Watcher application.

## 🏗️ Overview

The database package provides:

- **Prisma ORM** - Type-safe database client
- **SQLite** - File-based database for simplicity
- **Schema Management** - Database migrations and seeding
- **Type Generation** - Automatic TypeScript types

## 📁 Structure

```
packages/database/
├── src/
│   ├── client.ts              # Prisma client configuration
│   ├── index.ts              # Package exports
│   └── generated/            # Auto-generated Prisma client
├── prisma/
│   ├── schema.prisma         # Database schema definition
│   ├── dev.db               # SQLite database file
│   └── migrations/          # Database migrations
├── dist/                    # Compiled TypeScript
├── package.json
└── tsconfig.json
```

## 🗂️ Database Schema

### Watchlist Model

Represents monitoring rules with search terms:

```prisma
model Watchlist {
  id          String   @id @default(cuid())
  name        String                      // User-defined name
  description String?                     // Optional description
  terms       String                      // JSON string of search terms
  isActive    Boolean  @default(true)     // Enable/disable monitoring
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  events      Event[]                     // Associated security events

  @@map("watchlists")
}
```

### Event Model

Security events with AI analysis:

```prisma
model Event {
  id           String    @id @default(cuid())
  type         String                     // Event type (e.g., "suspicious_domain")
  description  String                     // Human-readable description
  metadata     String    @default("{}")   // JSON string with event details
  watchlistId  String                     // Foreign key to watchlist

  // AI Analysis Fields
  aiSummary       String?               // AI-generated summary
  aiSeverity      String?               // LOW/MED/HIGH/CRITICAL
  aiSuggestedAction String?             // Recommended response
  aiProcessedAt   DateTime?             // When AI analysis completed

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  watchlist    Watchlist @relation(fields: [watchlistId], references: [id], onDelete: Cascade)

  @@map("events")
}
```

## 🔧 Prisma Client Setup

### Client Configuration (`src/client.ts`)

```typescript
import { PrismaClient } from "./generated/client";

// Create configured Prisma client instance
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"] // Detailed logs in development
      : ["warn", "error"], // Only errors in production
});

export { prisma };
export type { Prisma } from "./generated/client";
```

### Package Exports (`src/index.ts`)

```typescript
// Export client and types for use in apps
export { prisma } from "./client";
export type { Prisma } from "./client";
```

## 🚀 Usage in Applications

### Backend API Usage

```typescript
import { prisma } from "@signal-watcher/database";

// Create a new watchlist
const watchlist = await prisma.watchlist.create({
  data: {
    name: "Suspicious Domains",
    description: "Monitor for malicious domains",
    terms: JSON.stringify(["malware", "phishing", "suspicious"]),
  },
});

// Find events with relations
const events = await prisma.event.findMany({
  where: {
    watchlistId: watchlist.id,
    aiSeverity: "HIGH",
  },
  include: {
    watchlist: true, // Include related watchlist data
  },
  orderBy: {
    createdAt: "desc",
  },
});

// Update with AI analysis
await prisma.event.update({
  where: { id: eventId },
  data: {
    aiSummary: "Potential malware distribution detected",
    aiSeverity: "HIGH",
    aiSuggestedAction: "Block domain immediately",
    aiProcessedAt: new Date(),
  },
});
```

### Data Type Handling

Since SQLite doesn't have native JSON support, we store complex data as strings:

```typescript
// Storing arrays/objects as JSON strings
const watchlist = await prisma.watchlist.create({
  data: {
    name: "API Monitoring",
    terms: JSON.stringify(["api", "authentication", "unauthorized"]), // Array → String
    metadata: JSON.stringify({
      severity: "medium",
      alertEmail: "admin@company.com",
    }), // Object → String
  },
});

// Parsing JSON strings back to objects
const retrievedWatchlist = await prisma.watchlist.findUnique({
  where: { id: watchlistId },
});

const terms: string[] = JSON.parse(retrievedWatchlist.terms);
const metadata: any = JSON.parse(retrievedWatchlist.metadata || "{}");
```

## 🔄 Database Operations

### Available Scripts

```bash
# Generate Prisma client (creates TypeScript types)
pnpm --filter @signal-watcher/database db:generate

# Create and apply migrations
pnpm --filter @signal-watcher/database db:migrate

# Reset database (useful for development)
pnpm --filter @signal-watcher/database db:reset

# Open Prisma Studio (visual database browser)
pnpm --filter @signal-watcher/database db:studio

# Deploy migrations (production)
pnpm --filter @signal-watcher/database db:deploy
```

### Development Workflow

1. **Modify Schema** - Edit `prisma/schema.prisma`
2. **Generate Migration** - Run `pnpm db:migrate`
3. **Generate Client** - Run `pnpm db:generate`
4. **Update Code** - Use new types in applications

## 🔍 Database Inspection

### Prisma Studio

Visual database browser for development:

```bash
pnpm --filter @signal-watcher/database db:studio
# Opens browser at http://localhost:5555
```

Features:

- **Visual Interface** - Browse tables and data
- **Edit Records** - Add/modify/delete data
- **Query Builder** - Test database queries
- **Relationship Visualization** - See connected data

### Direct SQLite Access

For advanced debugging:

```bash
# Access SQLite CLI
sqlite3 packages/database/prisma/dev.db

# Common SQLite commands
.tables                    # List all tables
.schema watchlists        # Show table schema
SELECT * FROM events;     # Query data
.quit                     # Exit CLI
```

## 📊 Query Examples

### Complex Queries

```typescript
// Get watchlists with event counts
const watchlistsWithCounts = await prisma.watchlist.findMany({
  include: {
    _count: {
      select: { events: true },
    },
    events: {
      where: {
        aiSeverity: { in: ["HIGH", "CRITICAL"] },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    },
  },
});

// Search events by metadata
const eventsWithDomain = await prisma.event.findMany({
  where: {
    metadata: {
      contains: "suspicious-domain.com", // JSON string search
    },
  },
});

// Aggregate queries
const severityCounts = await prisma.event.groupBy({
  by: ["aiSeverity"],
  _count: { id: true },
  where: {
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    },
  },
});
```

### Transaction Examples

```typescript
// Atomic operations
await prisma.$transaction(async (tx) => {
  // Create watchlist
  const watchlist = await tx.watchlist.create({
    data: { name: "New Monitor", terms: JSON.stringify(["term1"]) },
  });

  // Create initial event
  await tx.event.create({
    data: {
      type: "setup",
      description: "Watchlist created",
      watchlistId: watchlist.id,
    },
  });
});
```

## 🛠️ Schema Migrations

### Creating Migrations

```bash
# Create migration for schema changes
pnpm --filter @signal-watcher/database db:migrate --name add_new_field

# This creates:
# - SQL migration file in prisma/migrations/
# - Updates database schema
# - Regenerates Prisma client
```

### Migration Files

Generated SQL files in `prisma/migrations/`:

```sql
-- CreateTable
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "terms" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "watchlistId" TEXT NOT NULL,
    "aiSummary" TEXT,
    "aiSeverity" TEXT,
    "aiSuggestedAction" TEXT,
    "aiProcessedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "watchlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

## 🔐 Best Practices

### Type Safety

```typescript
// Use generated types
import type { Watchlist, Event, Prisma } from "@signal-watcher/database";

// Type-safe queries
const createData: Prisma.WatchlistCreateInput = {
  name: "Monitor",
  terms: JSON.stringify(["term"]),
};

// Type-safe includes
const eventWithWatchlist: Prisma.EventGetPayload<{
  include: { watchlist: true };
}> = await prisma.event.findUnique({
  where: { id },
  include: { watchlist: true },
});
```

### Error Handling

```typescript
try {
  const result = await prisma.event.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      // Unique constraint violation
      throw new AppError("Duplicate entry", 400);
    }
  }
  throw error;
}
```

### Connection Management

```typescript
// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

## 📈 Performance Tips

1. **Use Indexes** - Add to frequently queried fields
2. **Limit Results** - Use `take` and `skip` for pagination
3. **Select Fields** - Only fetch needed data with `select`
4. **Batch Operations** - Use `createMany` for bulk inserts
5. **Connection Pooling** - Configured automatically by Prisma

## 🚀 Production Considerations

### Environment Variables

```bash
# Development
DATABASE_URL="file:./dev.db"

# Production
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### Deployment

```bash
# Deploy migrations to production
pnpm --filter @signal-watcher/database db:deploy

# Generate client for production
pnpm --filter @signal-watcher/database db:generate
```

The database layer provides a solid foundation with type safety, migrations, and excellent developer experience through Prisma Studio and TypeScript integration!
