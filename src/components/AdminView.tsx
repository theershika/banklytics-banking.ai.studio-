import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Search,
  Filter,
  Lock,
  Download
} from 'lucide-react';
import { AdminDashboardData } from '../types/banking';
import { formatINR, formatUTCDate } from '../utils/exportUtils';

interface AdminViewProps {
  adminData: AdminDashboardData;
  onUpdateFlagStatus: (flagId: string, status: 'REVIEWED' | 'DISMISSED') => void;
  theme?: 'dark' | 'light';
}

export const AdminView: React.FC<AdminViewProps> = ({ adminData, onUpdateFlagStatus, theme = 'dark' }) => {
  const [customerSearch, setCustomerSearch] = useState('');
  const [flagFilter, setFlagFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  const filteredCustomers = adminData.customers_list.filter(
    (item) =>
      item.customer.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      item.customer.username.toLowerCase().includes(customerSearch.toLowerCase()) ||
      item.account.account_number.includes(customerSearch)
  );

  const filteredFlags = adminData.system_flags.filter((f) => {
    if (flagFilter === 'PENDING') return f.review_status === 'PENDING_REVIEW';
    if (flagFilter === 'RESOLVED') return f.review_status !== 'PENDING_REVIEW';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>ROLE-BASED ACCESS CONTROL • SYSTEM ADMINISTRATOR</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Banklytics Central Operations Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              System-wide liquidity oversight, aggregate customer accounts, and global anomaly monitoring. Restricted audit environment.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-medium">TOTAL SYSTEM LIQUIDITY</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400">
              {formatINR(adminData.system_balance_held)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Held across {adminData.total_accounts} accounts
            </span>
          </div>
        </div>
      </div>

      {/* 5 Core System KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Customers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{adminData.total_customers}</div>
          <span className="text-[10px] text-slate-500">Retail demo profiles</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Accounts</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{adminData.total_accounts}</div>
          <span className="text-[10px] text-slate-500">Active simulated ledgers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">System Deposits</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {formatINR(adminData.total_deposits_volume)}
          </div>
          <span className="text-[10px] text-slate-500">Total simulated inflows</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">System Debits</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
            {formatINR(adminData.total_withdrawals_volume)}
          </div>
          <span className="text-[10px] text-slate-500">Total simulated outflows</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Pending Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {adminData.unresolved_flags_count}
          </div>
          <span className="text-[10px] text-slate-500">Requires audit review</span>
        </div>
      </div>

      {/* Customer Accounts Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Registered Retail Customer Ledgers</span>
            </h2>
            <p className="text-xs text-slate-400">
              Account isolation audit — customer password hashes are strictly redacted from administrator view.
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search name or account #..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Account #</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3 text-right">Transactions</th>
                <th className="py-2.5 px-3 text-right">Ledger Balance</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-sans">
              {filteredCustomers.map(({ customer, account, transaction_count }) => (
                <tr key={customer.customer_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                    #{account.account_number}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {customer.full_name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    @{customer.username}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {customer.email}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {transaction_count}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    {formatINR(account.balance)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System-Wide Unusual Transaction Review */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>System-Wide Anomaly Review Flags</span>
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic rule flags triggered across all retail bank accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="ALL">All Incidents</option>
              <option value="PENDING">Pending Review Only</option>
              <option value="RESOLVED">Resolved / Cleared</option>
            </select>
          </div>
        </div>

        {filteredFlags.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p className="text-xs">No unusual transactions match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFlags.map((flag) => {
              const isPending = flag.review_status === 'PENDING_REVIEW';
              return (
                <div
                  key={flag.flag_id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-[10px]">
                        {flag.rule_name}
                      </span>
                      <span className="text-slate-400 font-mono">{flag.flag_id}</span>
                      <span className="text-cyan-400 font-semibold font-mono">
                        Acct #{flag.account_number} ({flag.customer_name})
                      </span>
                    </div>
                    <p className="text-slate-200">{flag.reason}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Ref: {flag.transaction_id} • Logged: {formatUTCDate(flag.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {flag.review_status}
                    </span>
                    {isPending && (
                      <button
                        onClick={() => onUpdateFlagStatus(flag.flag_id, 'REVIEWED')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] px-2.5 py-1 rounded-md transition-colors"
                      >
                        Clear Flag
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
