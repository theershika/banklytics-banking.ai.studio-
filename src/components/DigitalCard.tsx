import React, { useState } from 'react';
import { ShieldCheck, Wifi, Eye, EyeOff, Sparkles, Building2 } from 'lucide-react';
import { Account, Customer } from '../types/banking';
import { formatINR } from '../utils/exportUtils';

interface DigitalCardProps {
  customer: Customer;
  account: Account;
  theme?: 'dark' | 'light';
}

export const DigitalCard: React.FC<DigitalCardProps> = ({ customer, account, theme = 'dark' }) => {
  const [showFullNumber, setShowFullNumber] = useState(false);

  const maskedNumber = showFullNumber
    ? `BNK-SIM-${account.account_number.padStart(8, '0')}`
    : `•••• •••• •••• ${account.account_number}`;

  return (
    <div className="relative group perspective-1000 select-none">
      {/* 3D-effect Card Container */}
      <div className="w-full max-w-sm sm:max-w-md h-52 sm:h-56 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 text-white shadow-2xl border border-cyan-500/30 relative overflow-hidden transition-all duration-500 transform group-hover:-translate-y-1 group-hover:shadow-cyan-500/20 group-hover:border-cyan-400/50">
        {/* Holographic background light mesh */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-400/20 transition-all duration-700" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Diagonal watermark pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top Card Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/30">
              <span className="font-mono text-xs">BK</span>
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm sm:text-base font-mono text-white">
                BANK<span className="text-cyan-400">LYTICS</span>
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 -mt-0.5 font-medium">
                Digital Reserve
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>SIMULATION</span>
            </span>
            <Wifi className="w-4 h-4 text-slate-400 rotate-90" />
          </div>
        </div>

        {/* Middle Row: EMV Chip & Masked Account Number */}
        <div className="mt-5 relative z-10 flex items-center justify-between">
          {/* Simulated Golden EMV Chip */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-sm border border-amber-300/60 flex items-center justify-center">
            <div className="w-full h-full border border-amber-700/40 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
              <div className="border-r border-b border-amber-700/40" />
              <div className="border-b border-amber-700/40" />
              <div className="border-r border-amber-700/40" />
              <div />
            </div>
          </div>

          {/* Account Balance Snapshot */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Simulated Balance
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-cyan-300 tracking-tight">
              {formatINR(account.balance)}
            </span>
          </div>
        </div>

        {/* Masked Account Number Display */}
        <div className="mt-3 relative z-10 flex items-center justify-between">
          <span className="font-mono text-sm sm:text-base tracking-widest text-slate-200 font-bold">
            {maskedNumber}
          </span>
          <button
            onClick={() => setShowFullNumber(!showFullNumber)}
            className="text-slate-400 hover:text-cyan-300 p-1 transition-colors"
            title={showFullNumber ? 'Mask Account Number' : 'Reveal Account Number'}
          >
            {showFullNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Bottom Row: Holder Name & Account Type */}
        <div className="mt-4 pt-2 border-t border-slate-800/80 relative z-10 flex items-center justify-between text-xs">
          <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-medium">
              DEMO ACCOUNT HOLDER
            </span>
            <span className="font-semibold text-white tracking-wide uppercase text-xs truncate max-w-[170px] block">
              {customer.full_name}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-medium">
              LEDGER TIER
            </span>
            <span className="font-mono text-xs font-semibold text-cyan-400">
              {account.account_type} • INR
            </span>
          </div>
        </div>
      </div>

      {/* Educational Notice under card */}
      <div className="mt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
        <span>Virtual simulation identifier. No real CVV, PIN, or card details exist.</span>
      </div>
    </div>
  );
};
