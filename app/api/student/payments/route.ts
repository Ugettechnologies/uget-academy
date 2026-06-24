import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession() as any;

  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch payments.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession() as any;

  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { amount, reference, method, receiptUrl } = await request.json();

    if (!amount || !reference || !method) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.userId,
        amount: parseFloat(amount),
        reference,
        method,
        receiptUrl: receiptUrl || null,
        status: 'PENDING',
      },
    });

    // Create an ActivityLog entry for submitting payment
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'PAYMENT_SUBMITTED',
        details: `Submitted manual payment of ₦${parseFloat(amount).toLocaleString()} for verification. Ref: ${reference}`,
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('Create payment error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Reference number must be unique.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 });
  }
}
