import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Direct self-registration is disabled. Please enroll via the enrollment portal at https://www.uget-enrollment.online/' },
    { status: 403 }
  );
}
