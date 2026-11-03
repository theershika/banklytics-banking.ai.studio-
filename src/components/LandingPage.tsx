import React from 'react';
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  Activity,
  FileText,
  AlertTriangle,
  ArrowRight,
  Database,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Sparkles,
  Building2
} from 'lucide-react';
import { Customer, Account } from '../types/banking';
import { formatINR } from '../utils/exportUtils';

interface LandingPageProps {
  onGetStarted: () => void;
  onSelectDemoCustomer: (customerId: number) => void;
  onOpenCodeExplorer: () => void;
  demoAccounts: { customer: Customer; account: Account }[];
  theme?: 'dark' | 'light';
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSelectDemoCustomer,
  onOpenCodeExplorer,
  demoAccounts,
  theme = 'dark',
}) => {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 border border-slate-800 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Academic Project 16 • BANKLYTICS DIGITAL BANKING SIMULATION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Smart Banking.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
              Smarter Financial Insights.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            A premium full-stack digital banking experience powered by Python Flask, MySQL, and Pandas analytics. Features atomic decimal-safe ledgers, instant PDF statements and receipts, and automated descriptive financial trends.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectDemoCustomer(1)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Launch Demo Account #1001</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGetStarted}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-sm sm:text-base px-5 py-3 rounded-xl transition-all"
            >
              Sign In / Register
            </button>
            <button
              onClick={() => onSelectDemoCustomer(99)}
              className="bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-300 border border-indigo-700/60 font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          </div>

          <div className="pt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Educational banking simulation using synthetic financial ledger data. No real funds involved.</span>
          </div>
        </div>
      </section>

      {/* 5 Initial Demo Accounts Strip */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white">5 Initial Demo Bank Accounts</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-provisioned with initial ₹0.00 balances per academic requirements. Click any account to log in instantly:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {demoAccounts.map(({ customer, account }) => (
            <div
              key={account.account_number}
              onClick={() => onSelectDemoCustomer(customer.customer_id)}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    #{account.account_number}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full group-hover:bg-blue-600/30 group-hover:text-cyan-300 transition-colors">
                    1-Click
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-colors">
                  {customer.full_name}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{customer.username}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Balance:</span>
                <span className="font-mono font-bold text-white">{formatINR(account.balance)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Fintech Engineering Architecture</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Engineered to demonstrate enterprise banking patterns and scientific data analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Atomic Transaction Safety</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              DECIMAL(15,2) fixed-point arithmetic avoids binary floating-point rounding anomalies. Row-level locks strictly prevent race conditions and overdrafts.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Pandas Descriptive Insights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated month-over-month inflow/outflow variance analysis, ticket velocity, and peak activity tracking powered by Pandas and NumPy pipelines.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Role-Based Operations Console</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Administrative portal providing liquidity oversight, global transaction volume feeds, and centralized heuristic anomaly reviews without exposing credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-8 pb-12 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-500 flex items-center justify-center text-slate-950 font-mono text-xs font-bold">
            BK
          </div>
          <span className="font-bold text-white font-mono">BANKLYTICS</span>
          <span className="text-slate-500">|</span>
          <span>Smart Banking. Smarter Insights. • Academic Project 16</span>
        </div>
        <div className="text-slate-500">
          <span>Python 3.13 • Flask • MySQL 8.0 • Pandas • NumPy • Matplotlib • Bootstrap 5</span>
        </div>
      </footer>
    </div>
  );
};
