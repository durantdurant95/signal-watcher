# Frontend - Next.js Application 🎨

This document covers the Next.js 14 frontend setup with App Router, shadcn/ui, and TypeScript.

## 🏗️ Architecture Overview

The frontend uses Next.js 14 with the new App Router pattern and modern React patterns:

```
apps/frontend/
├── app/                    # App Router (no src folder)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── EventList.tsx     # Custom components
│   ├── WatchlistForm.tsx
│   └── WatchlistList.tsx
├── lib/                  # Utilities and API client
│   ├── api.ts           # Backend API client
│   └── utils.ts         # shadcn/ui utilities
├── package.json
└── tsconfig.json
```

## 🎯 Key Features

### App Router (Next.js 14)

- **No src folder** - Cleaner project structure
- **File-based routing** - Pages are defined by file structure
- **Server Components** - Better performance with SSR
- **Client Components** - Interactive UI with "use client"

### UI Framework

- **shadcn/ui** - Modern, accessible component library
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful icon library
- **Responsive Design** - Mobile-first approach

### Type Safety

- **TypeScript** - Full type coverage
- **Shared Types** - Types shared with backend via workspace
- **API Client** - Type-safe API calls

## 📱 Components Overview

### Main Page (`app/page.tsx`)

The main application interface that orchestrates all components:

```typescript
"use client"; // Client component for interactivity

export default function HomePage() {
  // State management with React hooks
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("");

  // Data loading on component mount
  useEffect(() => {
    loadData();
  }, []);

  // API calls to backend
  const loadData = async () => {
    try {
      const [watchlistsData, eventsData] = await Promise.all([
        api.watchlists.getAll(),
        api.events.getAll(),
      ]);
      setWatchlists(watchlistsData);
      setEvents(eventsData);
    } catch (err) {
      // Error handling
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Grid layout with watchlists and events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <WatchlistSection />
        <EventsSection />
      </div>
    </div>
  );
}
```

### WatchlistForm Component

Handles creating new watchlists with form validation:

```typescript
interface WatchlistFormProps {
  onSubmit: (watchlist: Watchlist) => void;
  onCancel: () => void;
}

export default function WatchlistForm({
  onSubmit,
  onCancel,
}: WatchlistFormProps) {
  // Form state
  const [formData, setFormData] = useState<CreateWatchlistRequest>({
    name: "",
    description: "",
    terms: [],
  });

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert comma-separated terms to array
    const terms = termsInput.split(",").map((term) => term.trim());

    // API call to create watchlist
    const newWatchlist = await api.watchlists.create({
      ...formData,
      terms,
    });

    onSubmit(newWatchlist); // Notify parent component
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Watchlist</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* shadcn/ui form components */}
          <Input /> <Textarea /> <Button />
        </form>
      </CardContent>
    </Card>
  );
}
```

### WatchlistList Component

Displays watchlists with actions (select, delete, simulate):

```typescript
export default function WatchlistList({
  watchlists,
  selectedWatchlist,
  onSelect,
  onDelete,
  onSimulate,
}: WatchlistListProps) {
  return (
    <div className="space-y-3">
      {watchlists.map((watchlist) => (
        <Card
          key={watchlist.id}
          className={cn(
            "cursor-pointer transition-colors hover:bg-gray-50",
            selectedWatchlist === watchlist.id && "ring-2 ring-blue-500"
          )}
          onClick={() => onSelect(watchlist.id)}
        >
          <CardContent className="p-4">
            {/* Watchlist details */}
            <h3>{watchlist.name}</h3>
            <p>{watchlist.description}</p>

            {/* Action buttons */}
            <Button onClick={() => onSimulate(watchlist.id)}>
              <Play className="h-4 w-4" />
            </Button>
            <Button onClick={() => onDelete(watchlist.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### EventList Component

Shows security events with AI analysis results:

```typescript
export default function EventList({ events }: EventListProps) {
  // Helper functions for severity styling
  const getSeverityColor = (severity?: string | null) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <h3>{event.type}</h3>
              {event.aiSeverity && (
                <Badge variant={getSeverityColor(event.aiSeverity)}>
                  {event.aiSeverity}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <p>{event.description}</p>

            {/* AI Analysis Section */}
            {event.aiSummary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span>AI Analysis</span>
                </div>
                <p>{event.aiSummary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 🔌 API Client (`lib/api.ts`)

Type-safe API client for backend communication:

```typescript
class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new APIError(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Watchlist operations
  watchlists = {
    getAll: () => this.request<Watchlist[]>("/api/watchlists"),
    create: (data: CreateWatchlistRequest) =>
      this.request<Watchlist>("/api/watchlists", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/api/watchlists/${id}`, { method: "DELETE" }),
  };

  // Event operations
  events = {
    getAll: (params?: { watchlistId?: string }) => {
      const query = params ? `?${new URLSearchParams(params)}` : "";
      return this.request<Event[]>(`/api/events${query}`);
    },
    simulate: (watchlistId: string, count: number) =>
      this.request("/api/events/simulate", {
        method: "POST",
        body: JSON.stringify({ watchlistId, count }),
      }),
  };
}

// Export singleton instance
export const api = new APIClient();
```

## 🎨 Styling with shadcn/ui + Tailwind

### Component Structure

shadcn/ui provides a modern component library built on Radix UI primitives:

```typescript
// Card component usage
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Watchlists</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Button variants
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="destructive">Delete Action</Button>

// Input components
<Input placeholder="Enter name..." />
<Textarea placeholder="Description..." />
<Select>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Tailwind CSS Classes

Utility-first CSS with responsive design:

```css
/* Layout */
.max-w-7xl mx-auto px-4 py-8  /* Container with padding */
.grid grid-cols-1 lg:grid-cols-3 gap-8  /* Responsive grid */
.flex items-center justify-between  /* Flexbox alignment */

/* Spacing */
.space-y-4  /* Vertical spacing between children */
.mb-4 mt-2  /* Margin bottom/top */
.p-4 px-6 py-3  /* Padding */

/* Colors */
.bg-blue-50 text-blue-900  /* Background and text color */
.border border-gray-200  /* Border styling */
.text-red-600 hover:text-red-700  /* Color with hover */

/* Effects */
.transition-colors  /* Smooth color transitions */
.hover:shadow-lg  /* Hover effects */
.rounded-lg  /* Border radius */
```

## 📱 Responsive Design

Mobile-first approach with Tailwind breakpoints:

```typescript
// Responsive grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* 1 column on mobile, 3 columns on large screens */}
</div>

// Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  {/* Larger text on bigger screens */}
</h1>

// Responsive spacing
<div className="px-4 sm:px-6 lg:px-8">
  {/* More padding on larger screens */}
</div>
```

## ⚡ Performance Optimizations

### Code Splitting

Next.js automatically splits code by pages and components:

```typescript
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <LoadingSpinner />,
});
```

### Image Optimization

```typescript
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // Load immediately
/>;
```

### API Optimization

```typescript
// Parallel API calls
const [watchlists, events] = await Promise.all([
  api.watchlists.getAll(),
  api.events.getAll(),
]);
```

## 🔧 Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🛠️ Configuration Files

### Next.js Config (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  },
};

module.exports = nextConfig;
```

### Tailwind Config (`tailwind.config.js`)

```javascript
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
};
```

### TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-backend.com
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Key Concepts Summary

| Concept           | Purpose               | Example                         |
| ----------------- | --------------------- | ------------------------------- |
| App Router        | File-based routing    | `app/page.tsx` → `/`            |
| Server Components | SSR performance       | Default in App Router           |
| Client Components | Interactivity         | `"use client"` directive        |
| shadcn/ui         | Component library     | `<Button>`, `<Card>`            |
| Tailwind          | Utility CSS           | `className="flex items-center"` |
| API Client        | Backend communication | `api.watchlists.getAll()`       |
| TypeScript        | Type safety           | Shared types with backend       |

## 🎯 Next Steps

1. **Explore components** - Start with `app/page.tsx`
2. **Customize UI** - Modify shadcn/ui components
3. **Add features** - Create new pages and components
4. **Test responsiveness** - Check mobile layouts
5. **Optimize performance** - Add loading states and error boundaries

The frontend is designed to be modern, accessible, and maintainable while providing a great user experience!
