import React from 'react';
import AdminLoginForm from '@/components/auth/AdminLoginForm';

export const dynamic = 'force-dynamic';

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 sm:p-8">
      <AdminLoginForm />
    </div>
  );
}
