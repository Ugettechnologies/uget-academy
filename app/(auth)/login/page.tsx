import React, { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white text-center text-xs py-8">Loading authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
