import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Mail,
  CreditCard,
  Building
} from 'lucide-react';
import { Customer, Account } from '../types/banking';
import { formatINR, formatUTCDate } from '../utils/exportUtils';

interface ProfileViewProps {
  customer: Customer;
  account: Account;
  onUpdateProfile: (name: string, email: string) => { success: boolean; message: string; customer?: Customer };
  onResetAccount: () => void;
  onSeedSampleData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  customer,
  account,
  onUpdateProfile,
  onResetAccount,
  onSeedSampleData,
}) => {
  const [fullName, setFullName] = useState(customer.full_name);
  const [email, setEmail] = useState(customer.email);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setFeedback({ type: 'error', message: 'Full name and email cannot be empty.' });
      return;
    }

    const res = onUpdateProfile(fullName, email);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              {customer.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{customer.full_name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Demo Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
                @{customer.username} • Acct #{account.account_number}
              </p>
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-5 p-4 rounded-xl flex items-center gap-2 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-600/40 text-emerald-200'
                : 'bg-rose-950/40 border border-rose-600/40 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Profile Details Form */}
        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 pt-4 border-t border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Legal Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Username (System Identifier)
              </label>
              <input
                type="text"
                value={customer.username}
                disabled
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-400 text-sm font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Simulated Account Number
              </label>
              <input
                type="text"
                value={account.account_number}
                disabled
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-cyan-400 text-sm font-mono cursor-not-allowed font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Update Profile Details
            </button>
          </div>
        </form>
      </div>

      {/* Account Metadata Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-cyan-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Account Tier</span>
            <span className="font-bold text-white text-sm">{account.account_type} Demo Ledger</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">KYC Simulation</span>
            <span className="font-bold text-emerald-400 text-sm">Verified Academic Tier</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Account Created</span>
            <span className="font-mono text-slate-200 text-xs">{formatUTCDate(account.created_at).slice(0, 10)}</span>
          </div>
        </div>
      </div>

      {/* Educational Data Management Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Educational Simulation Dataset Management</span>
        </h2>
        <p className="text-xs text-slate-400">
          Tools for teachers and examiners to test the banking analytics algorithms under both virgin state (₹0 balance) and rich transaction history.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Seed Sample Data */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Populate Sample Transactions
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Injects 10 realistic academic grant, lease, and stipend records over multiple months to demonstrate monthly charts, cash flows, and threshold flags.
              </p>
            </div>
            <button
              onClick={() => {
                onSeedSampleData();
                setFeedback({ type: 'success', message: 'Loaded 10 educational sample transactions successfully!' });
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Dataset</span>
            </button>
          </div>

          {/* Reset to Clean Zero */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                Reset Account to Initial ₹0.00
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Restores this account back to strict initial requirement specifications: zero transactions, ₹0.00 balance, and cleared flags.
              </p>
            </div>

            {confirmResetOpen ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetAccount();
                    setConfirmResetOpen(false);
                    setFeedback({ type: 'success', message: 'Account balance reset to ₹0.00 and ledger cleared.' });
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex-1"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmResetOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmResetOpen(true)}
                className="bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/60 text-slate-300 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to ₹0.00 Balance</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
