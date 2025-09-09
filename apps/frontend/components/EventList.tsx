import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DAL } from "@/lib/dal";
import { AlertTriangle, Brain, Clock, Shield } from "lucide-react";

interface EventListProps {
  selectedWatchlistId?: string;
}

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

// Server Component - no interactivity needed
export default async function EventList({
  selectedWatchlistId,
}: EventListProps) {
  const events = selectedWatchlistId
    ? await DAL.getAllEvents({ watchlistId: selectedWatchlistId })
    : await DAL.getAllEvents();

  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">No security events</p>
        <p className="text-sm">
          Events will appear here when they&apos;re detected or simulated
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        // Parse metadata safely
        let metadata = {};
        try {
          metadata =
            typeof event.metadata === "string"
              ? JSON.parse(event.metadata)
              : event.metadata || {};
        } catch (error) {
          console.warn("Failed to parse event metadata:", error);
          metadata = {};
        }

        return (
          <div key={event.id}>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {event.type.replace(/_/g, " ").toUpperCase()}
                      </h3>
                      {event.aiSeverity && (
                        <Badge variant={getSeverityColor(event.aiSeverity)}>
                          {event.aiSeverity}
                        </Badge>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      {event.description}
                    </p>
                  </div>
                  <div className="flex items-center ml-4 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(event.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* AI Analysis Section */}
                {event.aiSummary && (
                  <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        AI Analysis
                      </span>
                      {event.aiProcessedAt && (
                        <span className="text-xs text-blue-600">
                          Processed{" "}
                          {new Date(event.aiProcessedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-800">{event.aiSummary}</p>
                  </div>
                )}

                {/* Suggested Action Section */}
                {event.aiSuggestedAction && (
                  <div className="p-3 mb-4 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-900">
                        Suggested Action
                      </span>
                    </div>
                    <p className="text-sm text-amber-800">
                      {event.aiSuggestedAction}
                    </p>
                  </div>
                )}

                {/* Event Metadata */}
                {Object.keys(metadata).length > 0 && (
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Event Details
                    </h4>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {Object.entries(metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-medium text-gray-600">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                          </span>
                          <span className="ml-2 text-gray-900 break-all">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {index < events.length - 1 && <Separator className="my-4" />}
          </div>
        );
      })}
    </div>
  );
}
