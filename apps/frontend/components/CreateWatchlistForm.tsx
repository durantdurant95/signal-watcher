import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWatchlistAction } from "@/lib/actions";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

// Server Component form using Server Actions - no client-side JavaScript needed
export default function CreateWatchlistForm() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const termsInput = formData.get("terms") as string;
    if (!name?.trim()) return;
    const terms = termsInput
      .split(",")
      .map((term) => term.trim())
      .filter((term) => term.length > 0);
    if (terms.length === 0) return;
    const result = await createWatchlistAction({
      name: name.trim(),
      description: description?.trim() || "",
      terms,
    });
    if (result.success) redirect("/");
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create Watchlist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Watchlist</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Suspicious Login Attempts"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what this watchlist monitors..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terms">Search Terms *</Label>
            <Input
              id="terms"
              name="terms"
              type="text"
              placeholder="login, authentication, failed, suspicious (comma-separated)"
              required
            />
            <p className="text-sm text-gray-600">
              Enter keywords separated by commas that will trigger this
              watchlist
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit">Create Watchlist</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
