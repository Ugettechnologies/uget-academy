export async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    // Standard fallback for development
    if (process.env.NODE_ENV === 'development') return true;
    return false;
  }

  // Official Turnstile test key validation
  if (token === '1x00000000000000000000AA' || secretKey === '1x00000000000000000000000000000000AA') {
    return true;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const outcome = await response.json();
    return !!outcome.success;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
}
