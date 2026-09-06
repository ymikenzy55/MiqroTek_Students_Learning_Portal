import { auth } from "@/lib/auth";
import { getContacts } from "@/lib/messages";
import { MessageCenter } from "@/components/messages/MessageCenter";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function StudentMessagesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const contacts = userId
    ? await getContacts(userId, "STUDENT").catch(() => [])
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Talk directly with the instructors of your enrolled courses."
      />
      <MessageCenter contacts={contacts} role="STUDENT" />
    </div>
  );
}
