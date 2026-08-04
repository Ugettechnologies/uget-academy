import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = session.userId as string;
  const staffUserId = searchParams.get('staffUserId') || (session.role === 'STAFF' ? userId : undefined);

  try {
    const documents = await prisma.staffDocument.findMany({
      where: staffUserId ? { staffUserId } : undefined,
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching staff documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = session.userId as string;

  try {
    const body = await request.json();
    const { title, category, fileUrl, targetStaffUserId } = body;

    const staffUserId = targetStaffUserId || currentUserId;

    if (!title || !category || !fileUrl) {
      return NextResponse.json({ error: 'Title, category, and file URL are required' }, { status: 400 });
    }

    const document = await prisma.staffDocument.create({
      data: {
        staffUserId,
        title: title.trim(),
        category: category.trim(),
        fileUrl: fileUrl.trim(),
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Error creating staff document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
