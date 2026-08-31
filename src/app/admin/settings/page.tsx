import { Card } from "@/components/ui/Card";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
      <Card title="Platform Settings" description="Manage platform-wide configuration">
        <p className="text-sm text-[var(--muted)]">Settings will be available here in a future update.</p>
      </Card>
    </div>
  );
}
