"use client";

import { Button } from "@/components/ui/button";
import { deleteWatchlistAction, simulateEventsAction } from "@/lib/actions";
import { Play, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

interface WatchlistActionsProps {
  watchlistId: string;
}

// Client Component for interactive actions only
export default function WatchlistActions({
  watchlistId,
}: WatchlistActionsProps) {
  const [deletingId, setDeletingId] = useState<string>("");
  const [simulatingId, setSimulatingId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    startTransition(async () => {
      setDeletingId(watchlistId);
      try {
        await deleteWatchlistAction(watchlistId);
      } finally {
        setDeletingId("");
      }
    });
  };

  const handleSimulate = async (e: React.MouseEvent) => {
    e.stopPropagation();

    startTransition(async () => {
      setSimulatingId(watchlistId);
      try {
        await simulateEventsAction(watchlistId, 3);
      } finally {
        setSimulatingId("");
      }
    });
  };

  return (
    <div className="flex items-center gap-1 ml-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSimulate}
        disabled={simulatingId === watchlistId || isPending}
        className="h-8 w-8 p-0"
        title="Simulate events"
      >
        <Play className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={deletingId === watchlistId || isPending}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Delete watchlist"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
