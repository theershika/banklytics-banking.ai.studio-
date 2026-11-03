import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Receipt,
  FileText
} from 'lucide-react';
import { Transaction } from '../types/banking';
import { formatINR, formatUTCDate } from '../utils/exportUtils';
import { generateTransactionReceiptPDF, generateMonthlyStatementPDF } from '../utils/pdfExport';

interface TransactionsViewProps {
  accountNumber: string;
  customerName: string;
  accountType?: string;
  transactions: Transaction[];
  onExportCSV: () => void;
  theme?: 'dark' | 'light';
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  accountNumber,
  customerName,
  accountType = 'Savings',
  transactions,
  onExportCSV,
  theme = 'dark',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query (memo or ID)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.transaction_id.toLowerCase().includes(term) ||
          t.amount.toString().includes(term)
      );
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      result = result.filter((t) => t.transaction_type === typeFilter);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((t) => new Date(t.transaction_date).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.transaction_date).getTime() <= end.getTime());
    }

    // Amount range filter
    if (minAmount && !isNaN(Number(minAmount))) {
      result = result.filter((t) => t.amount >= Number(minAmount));
    }
    if (maxAmount && !isNaN(Number(maxAmount))) {
      result = result.filter((t) => t.amount <= Number(maxAmount));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      }
      if (sortBy === 'AMOUNT_DESC') {
        return b.amount - a.amount;
      }
      if (sortBy === 'AMOUNT_ASC') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, startDate, endDate, minAmount, maxAmount, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('NEWEST');
    setCurrentPage(1);
  };

  const handleExportPDF = () => {
    const now = new Date();
    const currentMonthSummary = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      month_name: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      opening_balance: filteredTransactions.length > 0 ? filteredTransactions[filteredTransactions.length - 1].balance_after : 0,
      total_deposits: filteredTransactions.filter(t => t.transaction_type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0),
      total_withdrawals: filteredTransactions.filter(t => t.transaction_type === 'WITHDRAWAL').reduce((s, t) => s + t.amount, 0),
      closing_balance: filteredTransactions.length > 0 ? filteredTransactions[0].balance_after : 0,
      net_change: 0,
      transaction_count: filteredTransactions.length,
    };
    generateMonthlyStatementPDF(currentMonthSummary, filteredTransactions, customerName, accountNumber, accountType);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Simulated Transaction History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit ledger for Account <span className="font-mono text-cyan-400 font-semibold">#{accountNumber}</span> ({filteredTransactions.length} of {transactions.length} records shown)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white border border-slate-700 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF Ledger</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search memo, voucher ref, or sum..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 font-mono"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Inflows (Deposits)</option>
              <option value="WITHDRAWAL">Outflows (Withdrawals)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="NEWEST">Date: Newest First</option>
              <option value="OLDEST">Date: Oldest First</option>
              <option value="AMOUNT_DESC">Amount: Highest First</option>
              <option value="AMOUNT_ASC">Amount: Lowest First</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center">
            <button
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Date & Amount Ranges Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400">Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none flex-1"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none flex-1"
            />
          </div>

          {/* Amount Range */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400">Amount (₹):</span>
            <input
              type="number"
              placeholder="Min ₹"
              value={minAmount}
              onChange={(e) => {
                setMinAmount(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none flex-1"
            />
            <span className="text-slate-500">to</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxAmount}
              onChange={(e) => {
                setMaxAmount(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none flex-1"
            />
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-600" />
            <p className="font-semibold text-white">No transactions found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No entries match your search criteria. Try clearing filters or perform a simulated transaction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date & Time (UTC)</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {paginatedTransactions.map((txn) => {
                  const isDeposit = txn.transaction_type === 'DEPOSIT';
                  const isLarge = txn.amount >= 25000;
                  return (
                    <tr key={txn.transaction_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-cyan-400 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{txn.transaction_id}</span>
                          {isLarge && (
                            <span title="Rule-based high value flag">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {formatUTCDate(txn.transaction_date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                        #{txn.account_number}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        {txn.description}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isDeposit ? '+' : '-'}{formatINR(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-300 whitespace-nowrap">
                        {formatINR(txn.balance_after)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => generateTransactionReceiptPDF(txn, customerName, accountType)}
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

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-white">
                {Math.min(currentPage * pageSize, filteredTransactions.length)}
              </span>{' '}
              of <span className="font-semibold text-white">{filteredTransactions.length}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono px-2 text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
