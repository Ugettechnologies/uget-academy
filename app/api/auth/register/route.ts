import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifyTurnstile } from '@/lib/turnstile';
import { signToken } from '@/lib/auth';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']),
  turnstileToken: z.string().min(1, 'Captcha token is required'),
});

export async function POST(request: Request) {
  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  // Rate Limit
  const rateLimitResult = await checkRateLimit(ip, 'register');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input data. Please check your inputs.' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, role, turnstileToken } = result.data;

    // Verify Turnstile Captcha
    const isValidCaptcha = await verifyTurnstile(turnstileToken);
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Check if user exists (vague error: "Registration failed. Please check your credentials or inputs.")
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Vague error: do not reveal that the email already exists
      return NextResponse.json(
        { error: 'Registration failed. Please check your inputs and try again.' },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the User
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
        role,
        emailVerified: false, // Must verify email
      },
    });

    // Create stateless verification token (expires in 24 hours)
    const verificationToken = await signToken({ userId: user.id, email: user.email });

    // Queue email sending (In production this inserts into email queue db)
    // For now we'll write to the DB or console log it
    // Let's create an email queue record if we have one, otherwise we will add it when we do Phase 4.
    // Let's print the token to development logs for easy verification
    console.log(`[VERIFICATION LINK] http://localhost:3000/verify-email?token=${verificationToken}`);

    return NextResponse.json(
      { message: 'Registration successful. Please check your email to verify your account.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
