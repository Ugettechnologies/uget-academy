import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { comparePassword, hashPassword, createSession } from '@/lib/auth';
import { checkLoginRateLimit } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.string().min(1, 'Email address or Student ID / Username is required'),
  password: z.string().min(1, 'Password is required'),
  expectedRole: z.string().optional(),
});

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const body = await request.json();
    const loginInput = body?.email || '';
    const expectedRole = body?.expectedRole;

    // Fast Rate Limiting check
    const rateLimitResult = await checkLoginRateLimit(ip, loginInput);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input data. Please check your inputs.' },
        { status: 400 }
      );
    }

    const { email: inputIdentifier, password } = result.data;
    const cleanIdentifier = inputIdentifier.trim().toLowerCase();

    // Query DB by Email or Username
    let user;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanIdentifier },
            { username: inputIdentifier.trim() },
          ],
        },
      });
    } catch {
      user = await prisma.user.findUnique({
        where: { email: cleanIdentifier },
      });
    }

    // Auto-provision Super Admin account for any new email signing in on Admin Portal if no Admin exists yet or for this email
    if (!user && expectedRole === 'ADMIN') {
      const passwordHash = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          email: cleanIdentifier,
          firstName: 'UGET',
          lastName: 'Admin',
          passwordHash,
          role: 'ADMIN',
          emailVerified: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid Email/Username or password.' },
        { status: 401 }
      );
    }

    // Check Lockout Status
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Account is temporarily locked. Please try again in ${minutesLeft} minutes.` },
        { status: 403 }
      );
    }

    // Compare password
    const isPasswordMatch = await comparePassword(password, user.passwordHash);

    if (!isPasswordMatch) {
      const updatedFailedAttempts = user.failedAttempts + 1;
      const shouldLockout = updatedFailedAttempts >= 5;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: updatedFailedAttempts,
          lockoutUntil: shouldLockout
            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
            : null,
        },
      });

      if (shouldLockout) {
        return NextResponse.json(
          { error: 'Too many failed login attempts. Your account has been locked for 15 minutes.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid Email/Username or password.' },
        { status: 401 }
      );
    }

    // Success: reset lockout fields and start session
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockoutUntil: null,
      },
    });

    await createSession(user.id, user.role);

    return NextResponse.json({
      message: 'Login successful',
      role: user.role,
      username: user.username,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
