import { prisma } from '@/lib/prisma';

export async function logAdminAction(params: {
  userId: string;
  userEmail: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, any>;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        targetId: params.targetId || null,
        metadata: params.metadata || undefined,
        ip: params.ip || null,
      },
    });
  } catch (error) {
    console.error('Error writing audit log:', error);
  }
}
