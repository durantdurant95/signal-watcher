import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DAL } from "@/lib/dal";
import { Users } from "lucide-react";
import WatchlistActions from "./WatchlistActions";

interface WatchlistProps {
  selectedWatchlistId?: string;
}

// Server Component for display logic
export default async function WatchlistListServer({
  selectedWatchlistId,
}: WatchlistProps) {
  const watchlists = await DAL.getAllWatchlists();

  if (watchlists.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 ">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No watchlists yet</p>
        <p className="text-sm">Create your first watchlist to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {watchlists.map((watchlist, index) => {
        // Parse terms safely
        const terms = Array.isArray(watchlist.terms)
          ? watchlist.terms
          : JSON.parse(watchlist.terms || "[]");

        const isSelected = selectedWatchlistId === watchlist.id;

        return (
          <div key={watchlist.id}>
            <Card
              data-watchlist-id={watchlist.id}
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {watchlist.name}
                    </h3>
                    {watchlist.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {watchlist.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {terms.slice(0, 3).map((term: string) => (
                        <Badge
                          key={term}
                          variant="secondary"
                          className="text-xs"
                        >
                          {term}
                        </Badge>
                      ))}
                      {terms.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{terms.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Client Component for interactive actions */}
                  <WatchlistActions watchlistId={watchlist.id} />
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>
                      Status:
                      <Badge
                        className="ml-1"
                        variant={watchlist.isActive ? "default" : "secondary"}
                      >
                        {watchlist.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </span>
                  </div>
                  <span>
                    Created {new Date(watchlist.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            {index < watchlists.length - 1 && <Separator className="my-2" />}
          </div>
        );
      })}
    </div>
  );
}
