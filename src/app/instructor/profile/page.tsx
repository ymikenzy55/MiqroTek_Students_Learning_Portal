import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSettings } from "@/components/profile/ProfileSettings";

export default async function InstructorProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      notifyOnMessage: true,
      instructorProfile: { select: { bio: true, avatarUrl: true, title: true } },
    },
  });

  if (!user) return null;

  return (
    <ProfileSettings
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        notifyOnMessage: user.notifyOnMessage,
      }}
      profile={
        user.instructorProfile
          ? {
              bio: user.instructorProfile.bio,
              avatarUrl: user.instructorProfile.avatarUrl,
              title: user.instructorProfile.title,
            }
          : null
      }
      basePath="/instructor"
    />
  );
}
