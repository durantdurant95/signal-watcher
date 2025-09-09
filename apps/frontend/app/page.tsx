import CreateWatchlistForm from "@/components/CreateWatchlistForm";
import EventList from "@/components/EventList";
import Watchlist from "@/components/Watchlist";

interface PageProps {
  searchParams: Promise<{ watchlist?: string }>;
}

// Maximum Server Component approach - uses URL params for state
export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const selectedWatchlistId = searchParams.watchlist;

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header Section - Server Component */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Signal Watcher</h1>
            <p className="mt-2 text-sm text-gray-700">
              Monitor security events with AI-powered analysis
            </p>
          </div>
          <CreateWatchlistForm />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Watchlist selectedWatchlistId={selectedWatchlistId} />
        </div>
        <div className="lg:col-span-2">
          <EventList selectedWatchlistId={selectedWatchlistId} />
        </div>
      </div>
    </div>
  );
}
