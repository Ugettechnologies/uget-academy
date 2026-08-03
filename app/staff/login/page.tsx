import React from 'react';
import StaffLoginForm from '@/components/auth/StaffLoginForm';

export const dynamic = 'force-dynamic';

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 sm:p-8">
      <StaffLoginForm />
    </div>
  );
}
