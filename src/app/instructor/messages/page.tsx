import { auth } from "@/lib/auth";
import { getContacts } from "@/lib/messages";
import { MessageCenter } from "@/components/messages/MessageCenter";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function InstructorMessagesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const contacts = userId
    ? await getContacts(userId, "SUPER_ADMIN").catch(() => [])
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Reply to students enrolled in your courses, or send an announcement to all of them at once."
      />
      <MessageCenter contacts={contacts} role="SUPER_ADMIN" />
    </div>
  );
}
