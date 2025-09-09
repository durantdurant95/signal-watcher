import {
  APIResponse,
  CreateEventRequest,
  CreateWatchlistRequest,
  Event,
  UpdateWatchlistRequest,
  Watchlist,
} from "@signal-watcher/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class DALError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "DALError";
  }
}

async function dalRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store", // Ensure fresh data for server components
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new DALError(response.status, data.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error instanceof DALError) {
      throw error;
    }
    throw new DALError(500, "Network error");
  }
}

export class DAL {
  // Watchlists
  static async getAllWatchlists(): Promise<Watchlist[]> {
    try {
      const response = await dalRequest<Watchlist[]>("/api/watchlists");
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch watchlists:", error);
      return [];
    }
  }

  static async getWatchlistById(id: string): Promise<Watchlist | null> {
    try {
      const response = await dalRequest<Watchlist>(`/api/watchlists/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Failed to fetch watchlist ${id}:`, error);
      return null;
    }
  }

  static async createWatchlist(
    data: CreateWatchlistRequest
  ): Promise<Watchlist | null> {
    try {
      const response = await dalRequest<Watchlist>("/api/watchlists", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data || null;
    } catch (error) {
      console.error("Failed to create watchlist:", error);
      throw error;
    }
  }

  static async updateWatchlist(
    id: string,
    data: UpdateWatchlistRequest
  ): Promise<Watchlist | null> {
    try {
      const response = await dalRequest<Watchlist>(`/api/watchlists/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.data || null;
    } catch (error) {
      console.error(`Failed to update watchlist ${id}:`, error);
      throw error;
    }
  }

  static async deleteWatchlist(id: string): Promise<boolean> {
    try {
      await dalRequest(`/api/watchlists/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete watchlist ${id}:`, error);
      throw error;
    }
  }

  // Events
  static async getAllEvents(filters?: {
    watchlistId?: string;
    severity?: string;
  }): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.watchlistId)
        params.append("watchlistId", filters.watchlistId);
      if (filters?.severity) params.append("severity", filters.severity);

      const endpoint = `/api/events${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await dalRequest<Event[]>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch events:", error);
      return [];
    }
  }

  static async getEventById(id: string): Promise<Event | null> {
    try {
      const response = await dalRequest<Event>(`/api/events/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      return null;
    }
  }

  static async createEvent(data: CreateEventRequest): Promise<Event | null> {
    try {
      const response = await dalRequest<Event>("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data || null;
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  }

  static async simulateEvents(
    watchlistId: string,
    count: number = 3
  ): Promise<Event[]> {
    try {
      const response = await dalRequest<Event[]>("/api/events/simulate", {
        method: "POST",
        body: JSON.stringify({ watchlistId, count }),
      });
      return response.data || [];
    } catch (error) {
      console.error("Failed to simulate events:", error);
      throw error;
    }
  }

  // Health
  static async getHealth(): Promise<{
    status: string;
    timestamp: string;
  } | null> {
    try {
      const response = await dalRequest<{ status: string; timestamp: string }>(
        "/health"
      );
      return response.data || null;
    } catch (error) {
      console.error("Health check failed:", error);
      return null;
    }
  }
}

export { DALError };
