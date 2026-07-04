import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { comparePassword, createSession } from '@/lib/auth';
import { checkLoginRateLimit } from '@/lib/rate-limit';
import { verifyTurnstile } from '@/lib/turnstile';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  turnstileToken: z.string().min(1, 'Captcha token is required'),
});

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const body = await request.json();
    const loginEmail = body?.email || '';

    // Rate Limiting by IP + email
    const rateLimitResult = await checkLoginRateLimit(ip, loginEmail);
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

    const { email, password, turnstileToken } = result.data;

    // Verify Turnstile
    const isValidCaptcha = await verifyTurnstile(turnstileToken);
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Vague error: do not reveal that the email doesn't exist
      return NextResponse.json(
        { error: 'Invalid email or password.' },
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
      // Increment failed attempts
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

      // Vague error: same message as if email doesn't exist
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Email verification check
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in.' },
        { status: 403 }
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
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
