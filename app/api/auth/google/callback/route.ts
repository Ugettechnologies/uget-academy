import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || origin;

  if (errorParam || !code) {
    return NextResponse.redirect(`${appUrl}/admin/login?error=Google authentication was cancelled or failed.`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/admin/login?error=Google OAuth environment variables are missing.`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Failed to exchange Google OAuth code:', tokenData);
      return NextResponse.redirect(`${appUrl}/admin/login?error=Failed to exchange Google authorization code.`);
    }

    // 2. Fetch user profile from Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userinfoResponse.json();

    if (!userinfoResponse.ok || !profile.email) {
      console.error('Failed to fetch Google user info:', profile);
      return NextResponse.redirect(`${appUrl}/admin/login?error=Failed to retrieve user profile from Google.`);
    }

    const email = profile.email.toLowerCase().trim();

    // 3. Gatekeeper check: Check if email matches allowed admin emails
    const allowedEmailsEnv = process.env.ADMIN_ALLOWED_EMAILS || 'ugettechnologies@gmail.com';
    const allowedEmails = allowedEmailsEnv
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!allowedEmails.includes(email)) {
      console.warn(`Unauthorized Admin sign-in attempt from Google account: ${email}`);
      return NextResponse.redirect(`${appUrl}/unauthorized`);
    }

    // 4. Find or create user record for Admin
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: profile.given_name || 'UGET',
          lastName: profile.family_name || 'Admin',
          passwordHash: 'OAUTH_EXTERNAL_ACCOUNT',
          role: 'ADMIN',
          emailVerified: true,
        },
      });
    } else if (user.role !== 'ADMIN') {
      // Elevate or ensure role is ADMIN for authorized email
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    }

    // 5. Assign ADMIN role session
    await createSession(user.id, 'ADMIN');

    // 6. Redirect to Admin Dashboard
    return NextResponse.redirect(`${appUrl}/admin`);
  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    return NextResponse.redirect(`${appUrl}/admin/login?error=An error occurred during Google authentication.`);
  }
}
