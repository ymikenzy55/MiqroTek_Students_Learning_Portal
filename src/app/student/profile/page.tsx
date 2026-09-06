import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileSettings } from "@/components/profile/ProfileSettings";

export default async function StudentProfile() {
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
      studentProfile: { select: { bio: true, avatarUrl: true } },
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
        user.studentProfile
          ? {
              bio: user.studentProfile.bio,
              avatarUrl: user.studentProfile.avatarUrl,
              title: null,
            }
          : null
      }
      basePath="/student"
    />
  );
}
