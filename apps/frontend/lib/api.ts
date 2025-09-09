import {
  APIResponse,
  CreateEventRequest,
  CreateWatchlistRequest,
  Event,
  UpdateWatchlistRequest,
  Watchlist,
} from "@signal-watcher/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(response.status, data.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, "Network error");
  }
}

export const api = {
  // Watchlists
  watchlists: {
    async getAll(): Promise<Watchlist[]> {
      const response = await apiRequest<Watchlist[]>("/api/watchlists");
      return response.data || [];
    },

    async getById(id: string): Promise<Watchlist> {
      const response = await apiRequest<Watchlist>(`/api/watchlists/${id}`);
      if (!response.data) {
        throw new Error("Watchlist not found");
      }
      return response.data;
    },

    async create(data: CreateWatchlistRequest): Promise<Watchlist> {
      const response = await apiRequest<Watchlist>("/api/watchlists", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.data) {
        throw new Error("Failed to create watchlist");
      }
      return response.data;
    },

    async update(id: string, data: UpdateWatchlistRequest): Promise<Watchlist> {
      const response = await apiRequest<Watchlist>(`/api/watchlists/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.data) {
        throw new Error("Failed to update watchlist");
      }
      return response.data;
    },

    async delete(id: string): Promise<void> {
      await apiRequest(`/api/watchlists/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Events
  events: {
    async getAll(filters?: {
      watchlistId?: string;
      severity?: string;
    }): Promise<Event[]> {
      const params = new URLSearchParams();
      if (filters?.watchlistId)
        params.append("watchlistId", filters.watchlistId);
      if (filters?.severity) params.append("severity", filters.severity);

      const endpoint = `/api/events${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await apiRequest<Event[]>(endpoint);
      return response.data || [];
    },

    async getById(id: string): Promise<Event> {
      const response = await apiRequest<Event>(`/api/events/${id}`);
      if (!response.data) {
        throw new Error("Event not found");
      }
      return response.data;
    },

    async create(data: CreateEventRequest): Promise<Event> {
      const response = await apiRequest<Event>("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.data) {
        throw new Error("Failed to create event");
      }
      return response.data;
    },

    async simulate(watchlistId: string, count: number = 3): Promise<Event[]> {
      const response = await apiRequest<Event[]>("/api/events/simulate", {
        method: "POST",
        body: JSON.stringify({ watchlistId, count }),
      });
      return response.data || [];
    },
  },

  // Health
  async health(): Promise<{ status: string; timestamp: string } | null> {
    const response = await apiRequest<{ status: string; timestamp: string }>(
      "/health"
    );
    return response.data || null;
  },
};

export { APIError };
