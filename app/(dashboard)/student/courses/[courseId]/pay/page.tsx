'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { CreditCard, Building, Lock, CheckCircle2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  price: number;
  description: string;
  instructor: {
    firstName: string;
    lastName: string;
  };
}

export default function EnrollmentCheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'PAYSTACK' | 'MANUAL'>('PAYSTACK');
  
  // State for manual transfer
  const [manualReference, setManualReference] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // General state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        // Fetch course and student profile in parallel
        const [courseRes, studentRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch('/api/student/me')
        ]);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse(courseData);
        } else {
          setError('Course details could not be retrieved.');
        }

        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudentEmail(studentData.email);
        } else {
          console.warn('Could not retrieve student email profile.');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while loading checkout.');
      } finally {
        setFetching(false);
      }
    };

    fetchCheckoutData();
  }, [courseId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Paystack online payment handler
  const handlePaystackPayment = () => {
    if (!course || !studentEmail) {
      setError('Please sign in again or wait until checkout finishes loading.');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setError('Paystack integration public key is not configured in .env.local.');
      return;
    }

    setLoading(true);
    setError(null);

    // Generate a unique reference format UGET-PAY-[courseId]-[timestamp]
    const transactionRef = `UGET-PAY-${course.id}-${Date.now()}`;

    try {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: studentEmail,
        amount: Math.round(course.price * 100), // in kobo
        currency: 'NGN',
        ref: transactionRef,
        callback: async (response: any) => {
          setVerificationStatus('Verifying payment reference...');
          await verifyPaystackTransaction(response.reference);
        },
        onClose: () => {
          setLoading(false);
          setVerificationStatus(null);
        }
      });
      handler.openIframe();
    } catch (err) {
      console.error(err);
      setError('Failed to initialize Paystack checkout. Please refresh and try again.');
      setLoading(false);
    }
  };

  // Verify Paystack payment on the server
  const verifyPaystackTransaction = async (reference: string) => {
    try {
      setVerificationStatus('Securing enrollment in classroom...');
      const response = await fetch('/api/student/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference, courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Payment verification failed. Please contact support.');
        setLoading(false);
        setVerificationStatus(null);
        return;
      }

      setSuccess('Payment verified successfully! Redirecting to classroom...');
      setTimeout(() => {
        router.push(`/student/courses/${courseId}`);
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('An error occurred during verification. Your payment was processed, please contact support if enrollment is not complete.');
      setLoading(false);
      setVerificationStatus(null);
    }
  };

  // Manual Transfer submission handler
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    if (!manualReference.trim()) {
      setError('Please provide your bank transfer transaction reference.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: course.price,
          reference: manualReference.trim(),
          method: 'MANUAL',
          receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400', // Mock receipt link
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit manual transfer details.');
        setLoading(false);
        return;
      }

      setSuccess('Bank transfer submitted successfully for verification! Redirecting to billing...');
      setTimeout(() => {
        router.push('/student/payments');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-slate-400">Preparing secure checkout portal...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-red-950/20 border border-red-900/40 rounded-full flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Checkout Error</h3>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
        <Link 
          href="/student/courses" 
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 px-6 py-3 text-sm font-semibold text-white transition"
        >
          Return to Course Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-white">
      {/* Script for Paystack Pop */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      <div>
        <Link
          href={`/student/courses/${courseId}`}
          className="text-xs font-semibold text-brand-accent hover:underline"
        >
          &larr; Cancel & Go Back
        </Link>
        <h2 className="text-3xl font-black text-white mt-2">
          Complete Enrollment
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Payment Methods Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payment Method Selector Tab */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-4 flex gap-4">
            <button
              onClick={() => { setPaymentMethod('PAYSTACK'); setError(null); }}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                paymentMethod === 'PAYSTACK'
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/10'
                  : 'bg-slate-950/40 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Paystack Card
            </button>
            <button
              onClick={() => { setPaymentMethod('MANUAL'); setError(null); }}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                paymentMethod === 'MANUAL'
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/10'
                  : 'bg-slate-950/40 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-4 h-4" />
              Bank Transfer
            </button>
          </div>

          {/* Paystack Payment View */}
          {paymentMethod === 'PAYSTACK' && (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-accent" />
                  Instant Card / USSD Payment
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Make payments securely using your local debit/credit card, USSD code, or mobile bank transfer via Paystack. Enrolled courses open instantly upon approval.
                </p>
              </div>

              <div className="border-t border-slate-850 pt-6 space-y-4">
                {error && (
                  <div className="p-3 text-xs bg-red-950/35 border border-red-900/40 text-red-400 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 text-xs bg-emerald-950/35 border border-emerald-900/40 text-emerald-450 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  onClick={handlePaystackPayment}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-sm font-semibold py-3.5 px-4 transition shadow-lg shadow-brand-primary/20 disabled:opacity-55"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{verificationStatus || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-brand-accent" />
                      <span>Pay with Paystack (₦{course?.price.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Manual Transfer View */}
          {paymentMethod === 'MANUAL' && (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-brand-accent" />
                  Direct Bank Transfer
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Transfer the exact enrollment fee to the corporate account below and supply your transaction reference number to log transfer details.
                </p>
              </div>

              {/* Bank Account Details */}
              <div className="bg-slate-950/60 border border-slate-850/80 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-450 font-medium">Bank Name</span>
                  <span className="text-slate-200 font-bold">Uget Tech Bank (Mock)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-450 font-medium">Account Name</span>
                  <span className="text-slate-200 font-bold">Uget Technologies</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-450 font-medium font-normal">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">1889113889</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('1889113889')}
                      className="p-1 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4 border-t border-slate-850 pt-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Transaction Reference Number</label>
                  <input
                    type="text"
                    required
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    placeholder="e.g. UGET-TX-123456"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:border-brand-primary focus:outline-none text-slate-200 placeholder:text-slate-600"
                  />
                </div>

                {error && (
                  <div className="p-3 text-xs bg-red-950/35 border border-red-900/40 text-red-400 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 text-xs bg-emerald-950/35 border border-emerald-900/40 text-emerald-450 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-sm font-semibold py-3.5 px-4 transition shadow-lg shadow-brand-primary/20 disabled:opacity-55"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Transfer Receipt</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-24">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Course Review
              </span>
              <h3 className="text-xl font-bold text-white mt-1.5 leading-snug">
                {course?.title}
              </h3>
              <p className="text-xs text-slate-450 mt-1 line-clamp-3">
                {course?.description}
              </p>
            </div>

            <div className="border-t border-slate-850 pt-6 space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>Tuition Cost</span>
                <span className="text-white">₦{course?.price.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>Verification / Portal Fee</span>
                <span className="text-white">₦0.00</span>
              </div>

              <div className="border-b border-slate-850 pb-4" />

              <div className="flex justify-between items-center text-base font-black text-white">
                <span>Total Due</span>
                <span className="text-brand-accent">₦{course?.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-850/60 rounded-2xl p-4 text-[10px] text-slate-450 leading-relaxed font-normal flex items-start gap-2.5">
              <Lock className="w-3.5 h-3.5 text-brand-accent flex-shrink-0 mt-0.5" />
              <span>
                Checkout is fully encrypted and secured. Your card details are never stored on our servers. Instant access will be enabled in your classroom catalog upon verification.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
