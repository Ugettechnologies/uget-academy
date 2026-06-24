import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { reference, courseId } = await request.json();

    if (!reference || !courseId) {
      return NextResponse.json({ error: 'Missing reference or course ID.' }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId as string,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ success: true, message: 'Already enrolled.' });
    }

    // Check if payment reference is already verified in our database
    const existingPayment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (existingPayment && existingPayment.status === 'VERIFIED') {
      // Recreate enrollment if payment was verified but enrollment didn't finish
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: session.userId as string,
          courseId: course.id,
        },
      });
      return NextResponse.json({ success: true, enrollment });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is missing from environment.');
      return NextResponse.json({ error: 'Paystack configuration error.' }, { status: 500 });
    }

    // Verify with Paystack API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    if (!paystackRes.ok) {
      console.error(`Paystack API returned status ${paystackRes.status}`);
      return NextResponse.json({ error: 'Failed to verify transaction with Paystack.' }, { status: 400 });
    }

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed or transaction not successful.' }, { status: 400 });
    }

    // Paystack amounts are in kobo (e.g. 5000000 kobo = ₦50,000)
    const amountPaid = paystackData.data.amount / 100;

    // Validate that the paid amount is correct (within 1 Naira margin of error)
    if (Math.abs(amountPaid - course.price) > 1.0) {
      console.error(`Payment amount mismatch. Paid: ₦${amountPaid}, Course price: ₦${course.price}`);
      return NextResponse.json({ error: 'Payment amount mismatch.' }, { status: 400 });
    }

    // Record the verified payment in the database (upsert to handle any race conditions)
    await prisma.payment.upsert({
      where: { reference },
      update: {
        status: 'VERIFIED',
      },
      create: {
        userId: session.userId as string,
        amount: amountPaid,
        reference,
        method: 'PAYSTACK',
        status: 'VERIFIED',
      },
    });

    // Enroll student in the course
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.userId as string,
        courseId: course.id,
      },
    });

    // Log activities
    await prisma.activityLog.create({
      data: {
        userId: session.userId as string,
        action: 'PAYMENT_VERIFIED',
        details: `Paystack payment of ₦${amountPaid.toLocaleString()} verified. Ref: ${reference}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.userId as string,
        action: 'ENROLLED',
        details: `Enrolled in course: ${course.title}`,
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    console.error('Enrollment/Verification error:', error);
    if (error.code === 'P2002') {
      // Unique constraint error if enrollment was concurrently created
      return NextResponse.json({ success: true, message: 'Already enrolled.' });
    }
    return NextResponse.json({ error: 'An error occurred during payment verification.' }, { status: 500 });
  }
}
