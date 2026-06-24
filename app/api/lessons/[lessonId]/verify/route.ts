import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getAsset } from '@/lib/mux';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const session = await getSession();

  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
    }

    // Ensure the instructor owns this course
    if (lesson.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    if (!lesson.muxAssetId) {
      return NextResponse.json({ error: 'No video asset associated with this lesson.' }, { status: 400 });
    }

    // Query Mux for asset status
    const asset = await getAsset(lesson.muxAssetId);
    
    // Extract playback ID
    const playbackId = asset.playback_ids?.[0]?.id;

    if (!playbackId) {
      return NextResponse.json({ 
        status: asset.status, 
        message: 'Video is still processing. Please try again in a few moments.' 
      }, { status: 202 }); // Accepted/Processing
    }

    // Update lesson database record
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        muxPlaybackId: playbackId,
      },
    });

    return NextResponse.json({
      message: 'Video verified successfully.',
      lesson: updatedLesson,
    });

  } catch (error) {
    console.error('Verify lesson video error:', error);
    return NextResponse.json({ error: 'Failed to verify video status.' }, { status: 500 });
  }
}
