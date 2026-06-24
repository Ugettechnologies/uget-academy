'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, History, AlertCircle, CheckCircle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  reference: string;
  method: string;
  receiptUrl: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  price: number;
}

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [method, setMethod] = useState('MANUAL');
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, coursesRes] = await Promise.all([
        fetch('/api/student/payments'),
        fetch('/api/courses')
      ]);

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
      }
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }
    } catch (err) {
      console.error('Error loading payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate a random Reference number for the student
  const generateReference = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    setReference(`UGET-TX-${rand}`);
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setAmount(course.price.toString());
    } else {
      setAmount('');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reference || !selectedCourseId) {
      setErrorMsg('Please select a course and fill in all fields.');
      return;
    }

    setSubmitLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/student/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          reference,
          method,
          receiptUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Failed to submit payment receipt.');
        setSubmitLoading(false);
        return;
      }

      setSuccessMsg('Payment submitted successfully for verification!');
      setSelectedCourseId('');
      setAmount('');
      setReference('');
      fetchData(); // Refresh history
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-white">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-brand-accent" />
          Payments & Billing
        </h2>
        <p className="mt-1.5 text-sm text-slate-400 font-normal leading-relaxed">
          Manage your course enrollments, upload manual transfer evidence, and review billing statements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form to submit mock payment */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 sticky top-24">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-brand-accent" />
              Record Transfer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Select a course and submit details of your bank transfer. Our system verifies receipts within 24 hours.
            </p>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Select Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-brand-primary focus:outline-none text-slate-200"
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id} className="bg-slate-900 text-slate-200">
                      {course.title} (₦{course.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-brand-primary focus:outline-none text-slate-200 placeholder:text-slate-600"
                  readOnly
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400">Transaction Reference</label>
                  <button
                    type="button"
                    onClick={generateReference}
                    className="text-[10px] font-bold text-brand-accent hover:underline"
                  >
                    Generate Ref
                  </button>
                </div>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. UGET-TX-123456"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-brand-primary focus:outline-none text-slate-200 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Mock Receipt Image Link</label>
                <input
                  type="text"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-brand-primary focus:outline-none text-slate-400"
                />
              </div>

              {errorMsg && (
                <div className="p-3 text-xs bg-red-950/35 border border-red-900/40 text-red-400 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 text-xs bg-emerald-950/35 border border-emerald-900/40 text-emerald-450 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full inline-flex items-center justify-center rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-sm font-semibold py-3 px-4 transition shadow-lg shadow-brand-primary/20 disabled:opacity-55"
              >
                {submitLoading ? 'Submitting...' : 'Upload Payment Receipt'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Payments History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-accent" />
              Transaction History
            </h3>
            <button
              onClick={fetchData}
              className="p-2 bg-slate-900/40 hover:bg-slate-800/40 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-3xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm font-medium">
                Loading billing statement...
              </div>
            ) : payments.length === 0 ? (
              <div className="py-20 text-center text-slate-450 text-sm font-medium">
                No billing transactions found. Submit a transfer receipt or mock checkout to view records.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/80">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-900/25 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-200">
                          {payment.reference}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                            {payment.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          ₦{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-450">
                          {new Date(payment.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              payment.status === 'VERIFIED'
                                ? 'bg-emerald-500/15 text-emerald-450 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                                : payment.status === 'REJECTED'
                                ? 'bg-red-500/15 text-red-400 border-red-500/20'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                payment.status === 'VERIFIED'
                                  ? 'bg-emerald-400'
                                  : payment.status === 'REJECTED'
                                  ? 'bg-red-450'
                                  : 'bg-amber-400 animate-ping'
                              }`}
                            />
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
