'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Eye, 
  RefreshCw, 
  User, 
  AlertCircle,
  FileText,
  X,
  Check,
  ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

interface PaymentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string | null;
}

interface PaymentRecord {
  id: string;
  amount: number;
  reference: string;
  method: string;
  receiptUrl?: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  userId: string;
  user: PaymentUser;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  totalCount: number;
}

export default function AdminPaymentManager() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/payments');
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
        setStats(data.stats);
      } else {
        showToast('error', data.error || 'Failed to load payments');
      }
    } catch (err) {
      showToast('error', 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateStatus = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    setUpdatingId(paymentId);
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status }),
      });
      const data = await response.json();

      if (data.success) {
        showToast('success', `Payment ${status.toLowerCase()} successfully!`);
        // Update local state
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status } : p))
        );
        // Refresh stats
        fetchPayments();
        if (selectedReceipt?.id === paymentId) {
          setSelectedReceipt(null);
        }
      } else {
        showToast('error', data.error || 'Failed to update status');
      }
    } catch (err) {
      showToast('error', 'Server error while updating payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered payments list
  const filteredPayments = payments.filter((payment) => {
    const matchesTab = activeTab === 'ALL' || payment.status === activeTab;
    const matchesSearch =
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-3 animate-slide-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/90 border-red-500/40 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-amber-950/50 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Platform Revenue & Receipts
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Payment Verification Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-xl">
            Inspect manual receipt uploads, verify student payments, approve course access, and manage platform revenue settlements.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Overview Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Verified Revenue */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Verified Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-emerald-400 font-mono">
            ₦{stats.totalRevenue.toLocaleString()}
          </h3>
          <span className="text-[11px] text-gray-400 block font-medium">
            Settled & Confirmed Payments
          </span>
        </div>

        {/* Pending Verifications */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-black text-amber-400">{stats.pendingCount}</h3>
            {stats.pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30 animate-pulse">
                Action Needed
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 block font-medium">
            Manual Receipts Awaiting Verification
          </span>
        </div>

        {/* Verified Count */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Verified Payments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{stats.verifiedCount}</h3>
          <span className="text-[11px] text-emerald-400 font-bold block">
            Approved & Granted Access
          </span>
        </div>

        {/* Rejected Count */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2 hover:border-amber-500/40 transition">
          <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
            <span>Rejected Payments</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-3xl font-black text-white">{stats.rejectedCount}</h3>
          <span className="text-[11px] text-red-400 font-bold block">
            Invalid Receipts / Flagged
          </span>
        </div>
      </div>

      {/* Control Panel: Filters & Search */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-[#1E293B] p-1.5 rounded-2xl border border-white/10">
            {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((tab) => {
              const count =
                tab === 'ALL'
                  ? stats.totalCount
                  : tab === 'PENDING'
                  ? stats.pendingCount
                  : tab === 'VERIFIED'
                  ? stats.verifiedCount
                  : stats.rejectedCount;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>
                    {tab === 'ALL'
                      ? 'All Payments'
                      : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      activeTab === tab
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Search Input */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <input
              type="text"
              placeholder="Search by student name, email, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E293B]/70 border border-white/10 text-xs text-white placeholder-gray-400 pl-9 pr-4 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none transition"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-400">Loading payment records...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-[#1E293B]/40 rounded-2xl border border-white/5">
              <CreditCard className="w-10 h-10 text-gray-500 mx-auto" />
              <h3 className="text-sm font-bold text-gray-300">No payment records found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No payment transactions match the active tab or search criteria.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 bg-white/5">
                  <th className="py-3.5 px-4 rounded-l-xl">Student</th>
                  <th className="py-3.5 px-4">Reference & Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Receipt</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {filteredPayments.map((payment) => {
                  const isPending = payment.status === 'PENDING';
                  const isVerified = payment.status === 'VERIFIED';
                  const isRejected = payment.status === 'REJECTED';
                  const isUpdatingThis = updatingId === payment.id;

                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center border border-white/20 shrink-0">
                            {payment.user.firstName.charAt(0)}
                            {payment.user.lastName.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white truncate">
                              {payment.user.firstName} {payment.user.lastName}
                            </span>
                            <span className="text-[11px] text-gray-400 truncate">
                              {payment.user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reference & Method */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold text-amber-300 block">
                            {payment.reference}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              payment.method === 'PAYSTACK'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {payment.method}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-mono font-bold text-sm text-white">
                        ₦{payment.amount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black">
                            <Clock className="w-3 h-3 animate-pulse" /> Pending
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-black">
                            <XCircle className="w-3 h-3 text-red-400" /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Receipt Preview */}
                      <td className="py-4 px-4">
                        {payment.receiptUrl ? (
                          <button
                            onClick={() => setSelectedReceipt(payment)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs italic">N/A (Paystack)</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(payment.id, 'VERIFIED')}
                            disabled={isUpdatingThis || isVerified}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isVerified
                                ? 'bg-emerald-500/10 text-emerald-400 opacity-50 cursor-not-allowed border border-emerald-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                            }`}
                            title="Verify Payment"
                          >
                            {isUpdatingThis ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(payment.id, 'REJECTED')}
                            disabled={isUpdatingThis || isRejected}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isRejected
                                ? 'bg-red-500/10 text-red-400 opacity-50 cursor-not-allowed border border-red-500/20'
                                : 'bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white'
                            }`}
                            title="Reject Payment"
                          >
                            {isUpdatingThis ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
                  Receipt Inspection
                </div>
                <h3 className="text-lg font-black text-white">
                  Payment Reference: {selectedReceipt.reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Payment Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#1E293B] p-4 rounded-2xl border border-white/10 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] font-extrabold uppercase block">
                  Student Name
                </span>
                <span className="font-bold text-white">
                  {selectedReceipt.user.firstName} {selectedReceipt.user.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] font-extrabold uppercase block">
                  Email
                </span>
                <span className="font-bold text-white truncate block">
                  {selectedReceipt.user.email}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] font-extrabold uppercase block">
                  Amount
                </span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  ₦{selectedReceipt.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Receipt Image Display */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-300 block">Uploaded Receipt Image:</span>
              <div className="relative min-h-[300px] max-h-[500px] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center p-2">
                {selectedReceipt.receiptUrl ? (
                  <img
                    src={selectedReceipt.receiptUrl}
                    alt="Payment Receipt"
                    className="max-h-[460px] w-auto object-contain rounded-xl"
                  />
                ) : (
                  <p className="text-xs text-gray-500">No image available</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
              {selectedReceipt.receiptUrl && (
                <a
                  href={selectedReceipt.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" /> Open Full Image
                </a>
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleUpdateStatus(selectedReceipt.id, 'REJECTED')}
                  disabled={updatingId === selectedReceipt.id}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Reject Receipt
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReceipt.id, 'VERIFIED')}
                  disabled={updatingId === selectedReceipt.id}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Approve Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
