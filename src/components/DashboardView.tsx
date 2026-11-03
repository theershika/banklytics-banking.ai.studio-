import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  History,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  BarChart3,
  Receipt
} from 'lucide-react';
import { Customer, Account, Transaction, AnalyticsStats, TransactionFlag } from '../types/banking';
import { formatINR, formatUTCDate } from '../utils/exportUtils';
import { generateTransactionReceiptPDF } from '../utils/pdfExport';
import { DigitalCard } from './DigitalCard';

interface DashboardViewProps {
  customer: Customer;
  account: Account;
  transactions: Transaction[];
  stats: AnalyticsStats;
  flags: (TransactionFlag & { transaction?: Transaction })[];
  setActiveTab: (tab: string) => void;
  onExportCSV: () => void;
  onSeedSampleData: () => void;
  theme?: 'dark' | 'light';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customer,
  account,
  transactions,
  stats,
  flags,
  setActiveTab,
  onExportCSV,
  onSeedSampleData,
  theme = 'dark',
}) => {
  const pendingFlags = flags.filter((f) => f.review_status === 'PENDING_REVIEW');
  const recentTransactions = transactions.slice(0, 6);

  const maxMonthlyVal = Math.max(
    ...stats.monthly_trends.map((m) => Math.max(m.deposits, m.withdrawals)),
    1000
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Digital Card & Account Overview Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Account Greeting & Quick Action Buttons (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden h-full flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Simulated {account.account_type} Account
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Acct #{account.account_number}
              </span>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Verified
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome to Banklytics, {customer.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Smart Banking. Smarter Insights. High-precision financial ledger with real-time balance calculations and descriptive data science analytics.
            </p>

            {/* Quick Banking Actions Ribbon */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => setActiveTab('deposit')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Deposit</span>
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-rose-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw</span>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3 py-2.5 rounded-xl transition-all"
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>History</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3 py-2.5 rounded-xl transition-all"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Statements</span>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className="flex items-center gap-1.5 bg-blue-900/40 hover:bg-blue-800/40 text-cyan-300 border border-cyan-800/50 font-semibold text-xs px-3 py-2.5 rounded-xl transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Smart Insights</span>
              </button>
            </div>
          </div>

          {/* Pending Alerts Strip */}
          {pendingFlags.length > 0 && (
            <div className="mt-5 p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>{pendingFlags.length} Unusual Transaction Flag(s)</strong> detected for educational review.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('flags')}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[11px] shrink-0"
              >
                Review
              </button>
            </div>
          )}
        </div>

        {/* Right: Premium Virtual Account Card (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <DigitalCard customer={customer} account={account} theme={theme} />
        </div>
      </div>

      {/* 5 Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Available Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Available Balance</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{formatINR(account.balance)}</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Acct #{account.account_number}</p>
        </div>

        {/* Total Deposits */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Deposits</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">{formatINR(stats.total_deposits)}</div>
          <p className="text-[10px] text-slate-500 mt-1">{stats.deposit_count} recorded credits</p>
        </div>

        {/* Total Withdrawals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Withdrawals</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 font-mono">{formatINR(stats.total_withdrawals)}</div>
          <p className="text-[10px] text-slate-500 mt-1">{stats.withdrawal_count} recorded debits</p>
        </div>

        {/* Monthly Net Cash Flow */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Net Cash Flow</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${stats.net_balance_change >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {formatINR(stats.net_balance_change)}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Inflow vs outflow delta</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Transactions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">{stats.transaction_count}</div>
          <p className="text-[10px] text-slate-500 mt-1">Audited ledger entries</p>
        </div>
      </div>

      {/* Main Grid: Mini Monthly Cash Flow Chart & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Flow Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Monthly Deposits vs Withdrawals
                </h2>
                <p className="text-xs text-slate-400">
                  Aggregated simulated ledger throughput across calendar months
                </p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Deep Analytics &rarr;
              </button>
            </div>

            <div className="h-60 w-full pt-2">
              {stats.monthly_trends.length === 0 || stats.transaction_count === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                  <Activity className="w-7 h-7 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-300 font-semibold">Account starts with ₹0.00 balance</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Perform your first simulated deposit or populate the educational dataset for testing.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                    >
                      Make Deposit
                    </button>
                    <button
                      onClick={onSeedSampleData}
                      className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Load Sample Data</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-end gap-3 h-44 w-full border-b border-slate-800 px-2 pb-2">
                    {stats.monthly_trends.map((item, idx) => {
                      const depHeight = maxMonthlyVal > 0 ? (item.deposits / maxMonthlyVal) * 140 : 0;
                      const withHeight = maxMonthlyVal > 0 ? (item.withdrawals / maxMonthlyVal) * 140 : 0;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          <div className="absolute -top-12 bg-slate-950 border border-slate-700 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                            <p className="font-bold text-slate-200">{item.month_name}</p>
                            <p className="text-emerald-400">Inflows: {formatINR(item.deposits)}</p>
                            <p className="text-rose-400">Outflows: {formatINR(item.withdrawals)}</p>
                          </div>

                          <div className="flex items-end gap-1.5 w-full justify-center">
                            <div
                              style={{ height: `${Math.max(depHeight, 4)}px` }}
                              className="w-1/2 max-w-[18px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm"
                            />
                            <div
                              style={{ height: `${Math.max(withHeight, item.withdrawals > 0 ? 4 : 0)}px` }}
                              className="w-1/2 max-w-[18px] bg-gradient-to-t from-rose-600 to-red-400 rounded-t-sm"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                            {item.month_name.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-2.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                      <span>Deposits</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                      <span>Withdrawals</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Highlights & Smart Insights Teaser */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Ledger Highlights
              </h3>
              <button
                onClick={() => setActiveTab('insights')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Insights &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Mean Operation Size</span>
                <span className="text-xs font-mono font-bold text-white">{formatINR(stats.average_transaction)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Peak Single Inflow</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{formatINR(stats.highest_deposit)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Peak Single Outflow</span>
                <span className="text-xs font-mono font-bold text-rose-400">{formatINR(stats.highest_withdrawal)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Deposit / Debit Ratio</span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {stats.withdrawal_count > 0 ? (stats.deposit_count / stats.withdrawal_count).toFixed(2) : stats.deposit_count}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Audit Protocol:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> DECIMAL(15,2)
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              Recent Activity
            </h2>
            <p className="text-xs text-slate-400">Real-time ledger entries with instant PDF receipt generation</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20"
            >
              Full Ledger ({transactions.length})
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-400">No transactions recorded yet</p>
            <p className="text-xs mt-1">Perform a simulated deposit or withdrawal to begin tracking activity.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Date (UTC)</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Description</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-right">Balance After</th>
                  <th className="pb-3 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {recentTransactions.map((txn) => {
                  const isDeposit = txn.transaction_type === 'DEPOSIT';
                  return (
                    <tr key={txn.transaction_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {formatUTCDate(txn.transaction_date)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isDeposit
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isDeposit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-medium">
                        <div>{txn.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{txn.transaction_id}</div>
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isDeposit ? '+' : '-'}{formatINR(txn.amount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300 font-medium whitespace-nowrap">
                        {formatINR(txn.balance_after)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => generateTransactionReceiptPDF(txn, customer.full_name, account.account_type)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                          title="Download Official PDF Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
