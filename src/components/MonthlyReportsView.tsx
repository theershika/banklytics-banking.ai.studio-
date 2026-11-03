import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Info,
  FileCheck
} from 'lucide-react';
import { Customer, Account, Transaction } from '../types/banking';
import { db } from '../services/storage';
import { formatINR, formatUTCDate, exportMonthlyReportToCSV } from '../utils/exportUtils';
import { generateMonthlyStatementPDF } from '../utils/pdfExport';

interface MonthlyReportsViewProps {
  customer: Customer;
  account: Account;
  theme?: 'dark' | 'light';
}

export const MonthlyReportsView: React.FC<MonthlyReportsViewProps> = ({ customer, account, theme = 'dark' }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  const reportData = useMemo(() => {
    return db.getMonthlyReport(account.account_number, selectedYear, selectedMonth);
  }, [account.account_number, selectedYear, selectedMonth]);

  const { summary, transactions } = reportData;

  const handleDownloadPDF = () => {
    generateMonthlyStatementPDF(summary, transactions, customer.full_name, account.account_number, account.account_type);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Monthly Bank Statements</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Certified simulated statement for Account <span className="font-mono text-cyan-400 font-semibold">#{account.account_number}</span>
          </p>
        </div>

        {/* Date Selector and Download Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-white text-xs sm:text-sm focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value} className="bg-slate-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-white text-xs sm:text-sm focus:outline-none"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => exportMonthlyReportToCSV(summary, transactions, account.account_number)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium px-3 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
          >
            <FileCheck className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-xl transition-colors shadow-sm border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Printable Statement Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-lg text-slate-200 relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Visible Watermark Across Statement */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.04] print:opacity-[0.08]">
          <span className="text-4xl sm:text-6xl font-extrabold uppercase -rotate-45 text-center text-white print:text-black leading-tight">
            EDUCATIONAL SIMULATION<br />NOT A REAL BANK STATEMENT
          </span>
        </div>

        {/* Banklytics Statement Letterhead */}
        <div className="relative z-10 border-b border-slate-800 print:border-slate-300 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white print:bg-black font-mono font-bold text-sm">
                BK
              </div>
              <div>
                <span className="font-extrabold text-2xl text-white font-mono tracking-tight print:text-black">
                  BANK<span className="text-cyan-400 print:text-blue-700">LYTICS</span>
                </span>
                <span className="block text-[10px] text-slate-400 print:text-slate-600 font-sans">
                  Smart Banking. Smarter Insights.
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 print:text-slate-500 mt-2">
              Academic Project 16 • Certified Simulated Financial Ledger Division
            </p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="inline-block px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold print:border-slate-400 print:text-black text-[11px]">
              MONTHLY ACCOUNT STATEMENT
            </span>
            <p className="font-extrabold text-white print:text-black text-sm mt-1">{summary.month_name}</p>
            <p className="text-slate-400 print:text-slate-600 font-mono text-[11px]">
              Generated: {new Date().toISOString().slice(0, 10)} UTC
            </p>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 mb-6 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-500 block font-semibold">
              ACCOUNT HOLDER
            </span>
            <span className="font-bold text-white print:text-black text-sm">{customer.full_name}</span>
            <span className="block text-slate-400 print:text-slate-600">{customer.email}</span>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-500 block font-semibold">
              ACCOUNT SPECIFICATIONS
            </span>
            <span className="font-mono font-bold text-cyan-400 print:text-black text-sm">
              Acct #{account.account_number} ({account.account_type})
            </span>
            <span className="block text-slate-400 print:text-slate-600">Currency: INR (₹)</span>
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-600 block">Opening Balance</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white print:text-black mt-1 block">
              {formatINR(summary.opening_balance)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-600 block">Total Deposits</span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 print:text-emerald-700 mt-1 block">
              +{formatINR(summary.total_deposits)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-600 block">Total Withdrawals</span>
            <span className="text-sm sm:text-base font-bold font-mono text-rose-400 print:text-rose-700 mt-1 block">
              -{formatINR(summary.total_withdrawals)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-600 block">Net Change</span>
            <span className={`text-sm sm:text-base font-bold font-mono mt-1 block ${summary.net_change >= 0 ? 'text-cyan-400 print:text-blue-800' : 'text-rose-400 print:text-rose-700'}`}>
              {formatINR(summary.net_change)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 print:border-slate-300 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-600 block">Closing Balance</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white print:text-black mt-1 block">
              {formatINR(summary.closing_balance)}
            </span>
          </div>
        </div>

        {/* Itemized Transactions Table */}
        <div className="relative z-10 space-y-3">
          <h3 className="font-semibold text-white print:text-black text-sm uppercase tracking-wider">
            Itemized Ledger Activity ({transactions.length} record{transactions.length !== 1 ? 's' : ''})
          </h3>

          {transactions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 print:border-slate-300 rounded-xl text-slate-400 print:text-slate-600">
              <Info className="w-6 h-6 mx-auto mb-1 text-slate-500" />
              <p className="text-sm font-medium">No transactions recorded during {summary.month_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Balance remained constant at {formatINR(summary.closing_balance)}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-700 uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Date (UTC)</th>
                    <th className="py-2.5 px-3">Ref ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                    <th className="py-2.5 px-3 text-right">Balance After (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 font-sans">
                  {transactions.map((t) => {
                    const isDep = t.transaction_type === 'DEPOSIT';
                    return (
                      <tr key={t.transaction_id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-mono text-slate-400 print:text-slate-600 whitespace-nowrap">
                          {formatUTCDate(t.transaction_date)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-400 print:text-slate-800 whitespace-nowrap">
                          {t.transaction_id}
                        </td>
                        <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                          <span className={isDep ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}>
                            {t.transaction_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 print:text-black">
                          {t.description}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${isDep ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                          {isDep ? '+' : '-'}{formatINR(t.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-black font-medium whitespace-nowrap">
                          {formatINR(t.balance_after)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statement Footer */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-800 print:border-slate-300 text-[11px] text-slate-500 print:text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Banklytics Educational Simulation Ledger • Verified Audit Trail</span>
          </div>
          <span>WATERMARK: EDUCATIONAL SIMULATION — NOT A REAL BANK STATEMENT</span>
        </div>
      </div>
    </div>
  );
};
