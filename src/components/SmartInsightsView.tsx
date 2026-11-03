import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Wallet,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { SmartInsights, AnalyticsStats } from '../types/banking';
import { formatINR } from '../utils/exportUtils';

interface SmartInsightsViewProps {
  insights: SmartInsights;
  stats: AnalyticsStats;
  accountNumber: string;
  theme?: 'dark' | 'light';
}

export const SmartInsightsView: React.FC<SmartInsightsViewProps> = ({
  insights,
  stats,
  accountNumber,
  theme = 'dark',
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Smart Financial Insights</h1>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-semibold">
                Pandas & NumPy Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Descriptive statistical trends computed over Account <span className="font-mono text-cyan-400 font-semibold">#{accountNumber}</span>.
            </p>
          </div>
        </div>

        {/* Regulatory & Educational Disclaimer */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Statistical Simulation Notice:</strong>
            <span>
              All observations are generated through historical variance analysis over simulated transactions. These descriptive summaries are provided solely for academic demonstration and do not constitute financial, investment, or banking advice.
            </span>
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Inflow Dynamic Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Month-over-Month Inflows</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          {insights.deposit_change ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${insights.deposit_change.increased ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {insights.deposit_change.increased ? '+' : '-'}{insights.deposit_change.diff_percent}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({formatINR(insights.deposit_change.diff_amount)})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{insights.deposit_change.text}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 pt-2">
              Requires 2 or more active months to compute Month-over-Month flow variance.
            </p>
          )}
        </div>

        {/* Outflow Dynamic Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Month-over-Month Outflows</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          {insights.withdrawal_change ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${insights.withdrawal_change.increased ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {insights.withdrawal_change.increased ? '+' : '-'}{insights.withdrawal_change.diff_percent}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({formatINR(insights.withdrawal_change.diff_amount)})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{insights.withdrawal_change.text}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 pt-2">
              Requires 2 or more active months to compute Month-over-Month expenditure variance.
            </p>
          )}
        </div>

        {/* Peak Volume Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Highest Activity Period</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          {insights.highest_activity_month ? (
            <div>
              <div className="text-xl font-bold text-white">
                {insights.highest_activity_month.month_name}
              </div>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">
                Total throughput: {formatINR(insights.highest_activity_month.volume)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 pt-2">No historical transaction activity recorded.</p>
          )}
        </div>
      </div>

      {/* Structured Insights Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Automated Descriptive Ledger Analysis</span>
        </h2>

        {insights.insights_list.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-sm">Perform deposits and withdrawals or load sample data to unlock descriptive insights.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.insights_list.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3.5 hover:border-slate-700 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    item.type === 'positive'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : item.type === 'warning'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-blue-500/10 text-cyan-400'
                  }`}
                >
                  {item.type === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : item.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        item.type === 'positive'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : item.type === 'warning'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
