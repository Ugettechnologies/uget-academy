import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

const instructorRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = instructorRegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Please provide valid information for all fields.' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, bio } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Temporary placeholder password hash until admin approves
    const tempPasswordHash = await hashPassword(crypto.randomUUID());

    // Create user with INSTRUCTOR role and PENDING_APPROVAL status
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: cleanEmail,
        phone,
        bio,
        role: 'INSTRUCTOR',
        status: 'PENDING_APPROVAL',
        passwordHash: tempPasswordHash,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      message: 'Instructor application submitted successfully! Admin will review and approve your account to issue your login credentials.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Instructor registration error:', error);
    return NextResponse.json(
      { error: 'Failed to submit registration application.' },
      { status: 500 }
    );
  }
}
