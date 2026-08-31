import { Card } from "@/components/ui/Card";
import { auth } from "@/lib/auth";

export default async function InstructorProfile() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Profile</h1>
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)] text-xl font-medium text-[var(--muted)]">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--foreground)]">{session?.user?.name}</p>
              <p className="text-sm text-[var(--muted)]">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
