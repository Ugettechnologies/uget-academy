import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

// GET /api/admin/payments - Retrieve all payments & overview metrics
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    // Fetch all payments with user info
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate aggregate overview stats across all payments
    const totalRevenue = payments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
    const verifiedCount = payments.filter((p) => p.status === 'VERIFIED').length;
    const rejectedCount = payments.filter((p) => p.status === 'REJECTED').length;

    // Filter by status if specified
    let filteredPayments = payments;
    if (statusFilter && statusFilter !== 'ALL') {
      filteredPayments = filteredPayments.filter((p) => p.status === statusFilter);
    }

    // Filter by search query if specified
    if (searchQuery) {
      filteredPayments = filteredPayments.filter(
        (p) =>
          p.reference.toLowerCase().includes(searchQuery) ||
          p.user.firstName.toLowerCase().includes(searchQuery) ||
          p.user.lastName.toLowerCase().includes(searchQuery) ||
          p.user.email.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      payments: filteredPayments,
      stats: {
        totalRevenue,
        pendingCount,
        verifiedCount,
        rejectedCount,
        totalCount: payments.length,
      },
    });
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment records' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/payments - Verify or Reject a payment
export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, status } = body as { paymentId: string; status: 'VERIFIED' | 'REJECTED' };

    if (!paymentId || !['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid input parameters. Payment ID and valid status required.' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status as PaymentStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: updatedPayment.userId,
        action: status === 'VERIFIED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
        details: `Payment reference ${updatedPayment.reference} of ₦${updatedPayment.amount.toLocaleString()} was marked as ${status} by admin.`,
      },
    });

    // Send notification to student
    const notificationMessage =
      status === 'VERIFIED'
        ? `Great news! Your payment of ₦${updatedPayment.amount.toLocaleString()} (Ref: ${updatedPayment.reference}) has been verified by the administration.`
        : `Notice: Your payment submission of ₦${updatedPayment.amount.toLocaleString()} (Ref: ${updatedPayment.reference}) could not be verified. Please contact support or re-upload your receipt.`;

    await prisma.notification.create({
      data: {
        userId: updatedPayment.userId,
        message: notificationMessage,
      },
    });

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: `Payment status successfully updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
