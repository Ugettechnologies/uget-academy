import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
  }

  try {
    await prisma.user.update({
      where: { id: payload.userId as string },
      data: { emailVerified: true },
    });

    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL('/login?error=VerificationFailed', request.url));
  }
}
