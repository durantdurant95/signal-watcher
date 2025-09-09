import { z } from "zod";

// Enums
export const SeveritySchema = z.enum(["LOW", "MED", "HIGH", "CRITICAL"]);
export type Severity = z.infer<typeof SeveritySchema>;

// Watchlist Schemas
export const CreateWatchlistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  terms: z.array(z.string().min(1)).min(1),
});

export const UpdateWatchlistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  terms: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
});

export type CreateWatchlistRequest = z.infer<typeof CreateWatchlistSchema>;
export type UpdateWatchlistRequest = z.infer<typeof UpdateWatchlistSchema>;

// Event Schemas
export const CreateEventSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional(),
  watchlistId: z.string(),
});

export type CreateEventRequest = z.infer<typeof CreateEventSchema>;

// AI Analysis
export interface AIAnalysis {
  summary: string;
  severity: Severity;
  suggestedAction: string;
}

// Database Models (matching Prisma)
export interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  terms: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, any>;
  watchlistId: string;
  aiSummary: string | null;
  aiSeverity: Severity | null;
  aiSuggestedAction: string | null;
  aiProcessedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  correlationId?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
