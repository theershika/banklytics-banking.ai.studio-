import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { TransactionFlag, Transaction } from '../types/banking';
import { formatINR, formatUTCDate } from '../utils/exportUtils';

interface FlagsViewProps {
  flags: (TransactionFlag & { transaction?: Transaction })[];
  accountNumber: string;
  onUpdateStatus: (flagId: string, status: 'REVIEWED' | 'DISMISSED') => void;
}

export const FlagsView: React.FC<FlagsViewProps> = ({ flags, accountNumber, onUpdateStatus }) => {
  const pendingFlags = flags.filter((f) => f.review_status === 'PENDING_REVIEW');
  const resolvedFlags = flags.filter((f) => f.review_status !== 'PENDING_REVIEW');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Unusual Transaction Review</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Rule-based heuristic flagging engine for simulated Account <span className="font-mono text-cyan-400 font-semibold">#{accountNumber}</span>.
            </p>
          </div>
        </div>

        {/* Mandatory Educational Notice */}
        <div className="mt-5 p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-200 text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white font-semibold">Educational Simulation Notice:</strong>
            <p className="text-slate-300 text-xs leading-relaxed">
              These are deterministic, rule-based educational review flags for academic demonstration — <strong>NOT</strong> fraud accusations or machine learning predictions. Simulated accounts flag high-value sums or rapid transaction bursts for audit review practice.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Explanation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          Active Deterministic Detection Rules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">Rule 1: High-Value Threshold</span>
            <p className="text-slate-400 leading-relaxed">
              Triggers when any single deposit or withdrawal equals or exceeds the demo threshold of <strong>₹25,000.00</strong>.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">Rule 2: Rapid Withdrawal Velocity</span>
            <p className="text-slate-400 leading-relaxed">
              Triggers when an account executes <strong>3 or more withdrawals</strong> within a rolling 60-minute window.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">Rule 3: Historical Deviation Spike</span>
            <p className="text-slate-400 leading-relaxed">
              Triggers when a transaction amount is <strong>&gt; 3x the account's historical average</strong> transaction size.
            </p>
          </div>
        </div>
      </div>

      {/* Flagged Transactions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <span>Flagged Transactions</span>
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/30">
              {pendingFlags.length} Pending
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Total {flags.length} incidents logged</span>
        </div>

        {flags.length === 0 ? (
          <div className="py-14 text-center text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400" />
            <p className="font-semibold text-white">No Unusual Activity Flagged</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All transactions comply with baseline rules. Performing a single deposit &ge; ₹25,000 will demonstrate the rule trigger!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {flags.map((item) => {
              const isPending = item.review_status === 'PENDING_REVIEW';
              const isDeposit = item.transaction?.transaction_type === 'DEPOSIT';

              return (
                <div key={item.flag_id} className="p-5 hover:bg-slate-850 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.rule_name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{item.flag_id}</span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {item.review_status === 'PENDING_REVIEW' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Needs Review
                        </span>
                      )}
                      {item.review_status === 'REVIEWED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Reviewed & Cleared
                        </span>
                      )}
                      {item.review_status === 'DISMISSED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Dismissed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trigger Reason */}
                  <p className="text-sm text-slate-200 font-medium">{item.reason}</p>

                  {/* Associated Transaction Details */}
                  {item.transaction && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className={isDeposit ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {isDeposit ? '+' : '-'}{formatINR(item.transaction.amount)}
                        </span>
                        <span className="text-slate-400">({item.transaction.transaction_type})</span>
                        <span className="text-slate-300 font-sans font-normal truncate max-w-xs">
                          {item.transaction.description}
                        </span>
                      </div>

                      <div className="text-slate-400 text-[11px]">
                        Ref: {item.transaction.transaction_id} • {formatUTCDate(item.transaction.transaction_date)}
                      </div>
                    </div>
                  )}

                  {/* Review Actions */}
                  {isPending && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onUpdateStatus(item.flag_id, 'REVIEWED')}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verify & Mark Reviewed</span>
                      </button>
                      <button
                        onClick={() => onUpdateStatus(item.flag_id, 'DISMISSED')}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Dismiss Flag</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
