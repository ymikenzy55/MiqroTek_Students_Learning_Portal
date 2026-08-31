import { EmptyState } from "@/components/ui/States";

export default function AdminBundles() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Bundles</h1>
      <EmptyState title="No bundles" description="All platform bundles will appear here." />
    </div>
  );
}
