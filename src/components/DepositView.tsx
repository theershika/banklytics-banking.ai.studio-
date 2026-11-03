import React, { useState } from 'react';
import {
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Receipt,
  FileCheck2,
  X
} from 'lucide-react';
import { Account, Transaction } from '../types/banking';
import { formatINR } from '../utils/exportUtils';
import { generateTransactionReceiptPDF } from '../utils/pdfExport';

interface DepositViewProps {
  account: Account;
  customerName: string;
  onDeposit: (amount: number, description: string) => { success: boolean; message: string; transaction?: Transaction; newBalance?: number };
  onSuccessNavigate: () => void;
  theme?: 'dark' | 'light';
}

export const DepositView: React.FC<DepositViewProps> = ({
  account,
  customerName,
  onDeposit,
  onSuccessNavigate,
  theme = 'dark',
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Salary & Direct Inflow');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; txn?: Transaction } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numAmount = parseFloat(amountStr) || 0;
  const projectedBalance = Math.round((account.balance + numAmount) * 100) / 100;

  const quickAmounts = [500, 1000, 5000, 10000, 25000];
  const categories = [
    'Salary & Direct Inflow',
    'Consulting & Professional Services',
    'Academic Research Grant / Honorarium',
    'Bank Cash Deposit',
    'Wire Transfer Inflow',
    'Investment Dividend Return',
    'Other Educational Credit',
  ];

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!amountStr || isNaN(numAmount) || numAmount <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid deposit amount greater than ₹0.' });
      return;
    }

    const decimals = amountStr.split('.')[1];
    if (decimals && decimals.length > 2) {
      setFeedback({ type: 'error', message: 'Amount cannot exceed 2 decimal places.' });
      return;
    }

    // Open confirmation review modal
    setConfirmModalOpen(true);
  };

  const handleConfirmedDeposit = () => {
    setIsSubmitting(true);
    setConfirmModalOpen(false);

    const finalDesc = description.trim() ? `${selectedCategory}: ${description.trim()}` : selectedCategory;
    const result = onDeposit(numAmount, finalDesc);

    if (result.success && result.transaction) {
      setFeedback({
        type: 'success',
        message: result.message,
        txn: result.transaction,
      });
      setAmountStr('');
      setDescription('');
    } else {
      setFeedback({
        type: 'error',
        message: result.message || 'Deposit failed. Please try again.',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Deposit Simulated Funds</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Credit funds to demo Account <span className="font-mono text-cyan-400 font-semibold">#{account.account_number}</span> atomically.
            </p>
          </div>
        </div>

        {/* Current Available Balance Bar */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>Available Balance:</span>
          </div>
          <span className="font-mono text-lg sm:text-xl font-bold text-white">
            {formatINR(account.balance)}
          </span>
        </div>

        {/* Success Alert / Receipt Download Banner */}
        {feedback && feedback.type === 'success' && feedback.txn && (
          <div className="mt-6 p-5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-200 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-bold text-white text-sm">{feedback.message}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-800/40 text-xs font-mono">
              <div>
                <span className="text-emerald-400/80 block text-[10px]">VOUCHER REF</span>
                <span className="text-white font-bold">{feedback.txn.transaction_id}</span>
              </div>
              <div>
                <span className="text-emerald-400/80 block text-[10px]">DEPOSIT AMOUNT</span>
                <span className="text-emerald-300 font-bold">+{formatINR(feedback.txn.amount)}</span>
              </div>
              <div>
                <span className="text-emerald-400/80 block text-[10px]">UPDATED BALANCE</span>
                <span className="text-white font-bold">{formatINR(feedback.txn.balance_after)}</span>
              </div>
              <div className="flex items-end justify-end gap-2">
                <button
                  onClick={() => generateTransactionReceiptPDF(feedback.txn!, customerName, account.account_type)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1 shadow-sm transition-colors"
                  title="Download Official PDF Receipt"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>PDF Receipt</span>
                </button>
                <button
                  onClick={onSuccessNavigate}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {feedback && feedback.type === 'error' && (
          <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePreSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Deposit Amount (₹ INR) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono font-bold text-lg">
                ₹
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white text-lg font-mono font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-[11px] text-slate-400 mr-1">Quick Select:</span>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountStr(amt.toString())}
                  className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Deposit Channel / Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Description / Memo <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Consulting Honorarium, Grant Disbursement"
              maxLength={120}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
          </div>

          {numAmount > 0 && (
            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Projected Balance after Deposit:
              </span>
              <span className="font-mono font-bold text-emerald-400 text-base">
                {formatINR(projectedBalance)}
              </span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || numAmount <= 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base py-3 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-5 h-5" />
              <span>Review & Confirm Deposit</span>
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Atomic DECIMAL(15,2) ledger processing with instant PDF voucher generation.</span>
        </div>
      </div>

      {/* Confirmation Screen Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Confirm Simulated Deposit</h3>
              </div>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Credit Amount</span>
              <div className="text-3xl font-bold font-mono text-emerald-400">+{formatINR(numAmount)}</div>
              <span className="text-xs text-slate-500">Destination: Account #{account.account_number}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Account Holder:</span>
                <span className="text-white font-semibold">{customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Category:</span>
                <span className="text-white">{selectedCategory}</span>
              </div>
              {description.trim() && (
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Memo:</span>
                  <span className="text-white truncate max-w-[200px]">{description.trim()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Balance Before:</span>
                <span className="font-mono text-white">{formatINR(account.balance)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-400">
                <span>Balance After:</span>
                <span className="font-mono font-bold text-emerald-400">{formatINR(projectedBalance)}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedDeposit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-900/30"
              >
                Commit Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
