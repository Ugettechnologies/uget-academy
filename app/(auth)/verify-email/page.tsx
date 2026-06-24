import React from 'react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md space-y-8 px-4 text-center sm:text-left sm:px-6">
      <div className="flex justify-center sm:justify-start">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"
            />
          </svg>
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-extrabold text-brand-navy dark:text-white">
          Verify Your Email
        </h2>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          We have sent a verification link to your registered email address. 
          Please open the email and click the link to activate your account.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Didn't receive the email? Check your spam folder or wait a couple of minutes.
        </p>
      </div>

      <div className="pt-6">
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition duration-150"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
