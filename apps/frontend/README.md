# Frontend - Next.js Application 🎨

This document covers the Next.js 15 frontend setup with App Router, shadcn/ui, and TypeScript.

## 🏗️ Architecture Overview

The frontend uses Next.js 15 with the new App Router pattern and modern React patterns:

# Frontend - Next.js Application 🎨

This guide covers the Next.js 15 frontend setup using App Router, shadcn/ui, TypeScript, and integration with a separate backend API.

## 🏗️ Architecture Overview

The frontend uses Next.js App Router with server components, shadcn/ui, and Tailwind CSS:

## 🎯 Key Features

- **App Router**: File-based routing, server components by default
- **shadcn/ui**: Modern, accessible UI components
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety
- **Dialog-based forms**: Watchlist creation uses shadcn Dialog
- **API integration**: Calls backend API via environment variable

## 📱 Main Components

### Main Page (`app/page.tsx`)

- Composes the UI with `<Watchlist />` and `<EventList />` server components
- Places the CreateWatchlistForm dialog trigger aligned with the title
- Fetches data server-side for best performance

### Watchlist Section (`components/Watchlist.tsx`)

- Displays all watchlists
- Uses `<CreateWatchlistForm />` dialog for new watchlists
- Allows simulating events and deleting watchlists via server actions

### Event List (`components/EventList.tsx`)

- Shows security events, severity, and AI analysis
- Uses shadcn/ui cards and badges for styling

### CreateWatchlistForm (`components/CreateWatchlistForm.tsx`)

- Uses shadcn Dialog for modal form
- Server action for creating watchlists (no client JS required)

## 🔌 API Integration

- API client in `lib/api.ts` uses `NEXT_PUBLIC_API_URL` to call backend
- All data fetching and mutations use server actions or API calls

## 🎨 Styling

- shadcn/ui components (Card, Button, Dialog, Badge, etc.)
- Tailwind CSS for layout, spacing, colors, and responsiveness

## ⚡ Performance

- Server components for fast SSR
- Suspense boundaries for loading states
- Minimal client-side JS

## 🛠️ Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🛠️ Configuration

- `next.config.js`: Set `NEXT_PUBLIC_API_URL` for backend API
- `tailwind.config.js`: Configure Tailwind for app and components
- `.env`: Store environment variables

## 🚀 Deployment

- Deploy frontend to Vercel or Render as a Next.js app
- Set `NEXT_PUBLIC_API_URL` to your backend’s public URL
- For backend, deploy separately (Render recommended)

## 📚 Key Concepts

| Concept           | Purpose               | Example                          |
| ----------------- | --------------------- | -------------------------------- |
| App Router        | File-based routing    | `app/page.tsx` → `/`             |
| Server Components | SSR performance       | Default in App Router            |
| shadcn/ui         | Component library     | `<Button>`, `<Card>`, `<Dialog>` |
| Tailwind          | Utility CSS           | `className="flex items-center"`  |
| API Client        | Backend communication | `api.watchlists.getAll()`        |
| TypeScript        | Type safety           | Shared types with backend        |

## 🎯 Next Steps

1. Explore `app/page.tsx` and main components
2. Customize UI with shadcn/ui and Tailwind
3. Add features or new pages as needed
4. Test responsiveness and performance
5. Deploy to Vercel or Render

The frontend is modern, accessible, and designed for maintainability and performance.

<form onSubmit={handleSubmit}>
