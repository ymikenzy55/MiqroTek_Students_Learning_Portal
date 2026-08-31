import { EmptyState } from "@/components/ui/States";

export default function StudentBundles() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Bundles</h1>
      <EmptyState title="No bundles assigned" description="Your assigned bundles will appear here." />
    </div>
  );
}
