"use server";

import {
  CreateWatchlistRequest,
  UpdateWatchlistRequest,
} from "@signal-watcher/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DAL } from "./dal";

// Watchlist Actions
export async function createWatchlistAction(data: CreateWatchlistRequest) {
  try {
    const watchlist = await DAL.createWatchlist(data);
    if (!watchlist) {
      return { success: false, error: "Failed to create watchlist" };
    }

    revalidatePath("/");
    return { success: true, data: watchlist };
  } catch (error) {
    console.error("Create watchlist action failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create watchlist",
    };
  }
}

export async function updateWatchlistAction(
  id: string,
  data: UpdateWatchlistRequest
) {
  try {
    const watchlist = await DAL.updateWatchlist(id, data);
    if (!watchlist) {
      return { success: false, error: "Failed to update watchlist" };
    }

    revalidatePath("/");
    return { success: true, data: watchlist };
  } catch (error) {
    console.error("Update watchlist action failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update watchlist",
    };
  }
}

export async function deleteWatchlistAction(id: string) {
  try {
    const success = await DAL.deleteWatchlist(id);
    if (!success) {
      return { success: false, error: "Failed to delete watchlist" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete watchlist action failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete watchlist",
    };
  }
}

// Event Actions
export async function simulateEventsAction(
  watchlistId: string,
  count: number = 3
) {
  try {
    const events = await DAL.simulateEvents(watchlistId, count);
    revalidatePath("/");
    return { success: true, data: events };
  } catch (error) {
    console.error("Simulate events action failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to simulate events",
    };
  }
}

// Navigation actions (for handling form states)
export async function redirectToHomePage() {
  redirect("/");
}

// Data fetching actions (for use in client components when needed)
export async function getFilteredEventsAction(watchlistId?: string) {
  try {
    const events = await DAL.getAllEvents(
      watchlistId ? { watchlistId } : undefined
    );
    return { success: true, data: events };
  } catch (error) {
    console.error("Get filtered events action failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch events",
    };
  }
}
