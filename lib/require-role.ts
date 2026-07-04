import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function requireRole(allowed: Array<'ADMIN' | 'STAFF' | 'STUDENT' | 'INSTRUCTOR'>) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  // Retrieve fresh user info from the database to verify the role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!user || !allowed.includes(user.role as any)) {
    redirect('/unauthorized');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    userId: user.id,
    role: user.role,
  };
}
