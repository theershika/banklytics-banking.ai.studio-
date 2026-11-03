import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  Sparkles,
  Layers,
  Activity,
  Filter,
  FileText
} from 'lucide-react';
import { AnalyticsStats } from '../types/banking';
import { formatINR, exportAnalyticsToCSV } from '../utils/exportUtils';

interface AnalyticsViewProps {
  stats: AnalyticsStats;
  accountNumber: string;
  onSeedSampleData: () => void;
  theme?: 'dark' | 'light';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  accountNumber,
  onSeedSampleData,
  theme = 'dark',
}) => {
  const [filterQuarter, setFilterQuarter] = useState<string>('ALL');

  // Filter trends by selected quarter if desired
  const filteredTrends = useMemo(() => {
    if (filterQuarter === 'ALL') return stats.monthly_trends;
    // e.g. Q1 (Jan-Mar), Q2 (Apr-Jun), etc.
    const qMap: Record<string, string[]> = {
      Q1: ['01', '02', '03'],
      Q2: ['04', '05', '06'],
      Q3: ['07', '08', '09'],
      Q4: ['10', '11', '12'],
    };
    const targetMonths = qMap[filterQuarter] || [];
    return stats.monthly_trends.filter((m) => {
      const monthPart = m.month_key.split('-')[1];
      return targetMonths.includes(monthPart);
    });
  }, [stats.monthly_trends, filterQuarter]);

  const maxDepositWithdraw = Math.max(
    ...filteredTrends.map((m) => Math.max(m.deposits, m.withdrawals)),
    1000
  );

  const maxNetFlowAbs = Math.max(
    ...filteredTrends.map((m) => Math.abs(m.net_flow)),
    1000
  );

  const totalVolume = stats.total_deposits + stats.total_withdrawals;
  const depositPct = totalVolume > 0 ? (stats.total_deposits / totalVolume) * 100 : 50;
  const withdrawalPct = totalVolume > 0 ? (stats.total_withdrawals / totalVolume) * 100 : 50;

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('analytics-composite-chart');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgElement);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Banklytics_Analytics_${accountNumber}_${new Date().toISOString().slice(0, 10)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Financial Analytics & Insights Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pandas & NumPy scientific models computed over Account <span className="font-mono text-cyan-400 font-semibold">#{accountNumber}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quarter filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filterQuarter}
              onChange={(e) => setFilterQuarter(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Months</option>
              <option value="Q1" className="bg-slate-900">Q1 (Jan - Mar)</option>
              <option value="Q2" className="bg-slate-900">Q2 (Apr - Jun)</option>
              <option value="Q3" className="bg-slate-900">Q3 (Jul - Sep)</option>
              <option value="Q4" className="bg-slate-900">Q4 (Oct - Dec)</option>
            </select>
          </div>

          <button
            onClick={() => exportAnalyticsToCSV(stats, accountNumber)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadSVG}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Chart SVG</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Ticket Size</span>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
            {formatINR(stats.average_transaction)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.transaction_count} ledger entries</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Largest Single Inflow</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1">
            {formatINR(stats.highest_deposit)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.deposit_count} deposits total</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Largest Single Outflow</span>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 font-mono mt-1">
            {formatINR(stats.highest_withdrawal)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.withdrawal_count} debits total</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Net Balance Delta</span>
          <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${stats.net_balance_change >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {formatINR(stats.net_balance_change)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Aggregated Cash Reserve</span>
        </div>
      </div>

      {/* Empty State Banner */}
      {stats.transaction_count === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-dashed border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Transactions Recorded Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            This account starts with ₹0.00. You can perform transactions through Deposit/Withdraw, or populate the 10-item educational dataset to explore multi-month data science models!
          </p>
          <button
            onClick={onSeedSampleData}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Educational Sample Dataset</span>
          </button>
        </div>
      )}

      {/* 5 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Deposit-versus-Withdrawal Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                1. Deposits vs Withdrawals by Period
              </h2>
              <p className="text-xs text-slate-400">Monthly credit vs debit comparison (₹ INR)</p>
            </div>
          </div>

          <div className="h-64 flex flex-col justify-between pt-4">
            <div className="flex items-end gap-3 h-48 w-full border-b border-slate-800 px-2 pb-2">
              {filteredTrends.map((item, idx) => {
                const depH = maxDepositWithdraw > 0 ? (item.deposits / maxDepositWithdraw) * 150 : 0;
                const withH = maxDepositWithdraw > 0 ? (item.withdrawals / maxDepositWithdraw) * 150 : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-12 bg-slate-950 border border-slate-700 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                      <p className="font-bold">{item.month_name}</p>
                      <p className="text-emerald-400">+{formatINR(item.deposits)}</p>
                      <p className="text-rose-400">-{formatINR(item.withdrawals)}</p>
                    </div>

                    <div className="flex items-end gap-1.5 w-full justify-center">
                      <div
                        style={{ height: `${Math.max(depH, item.deposits > 0 ? 4 : 0)}px` }}
                        className="w-1/2 max-w-[20px] bg-emerald-500 rounded-t-sm"
                      />
                      <div
                        style={{ height: `${Math.max(withH, item.withdrawals > 0 ? 4 : 0)}px` }}
                        className="w-1/2 max-w-[20px] bg-rose-500 rounded-t-sm"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                      {item.month_name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span>Deposits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-500" />
                <span>Withdrawals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Transaction-Type Distribution Doughnut */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                2. Transaction-Type Distribution
              </h2>
              <p className="text-xs text-slate-400">Financial volume breakdown & proportion</p>
            </div>
          </div>

          <div className="h-64 flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="12" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(depositPct / 100) * 238.76} 238.76`}
                  strokeDashoffset="0"
                  className="transition-all duration-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#f43f5e"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(withdrawalPct / 100) * 238.76} 238.76`}
                  strokeDashoffset={`-${(depositPct / 100) * 238.76}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Flow</span>
                <span className="text-xs font-bold text-white font-mono">{formatINR(totalVolume)}</span>
              </div>
            </div>

            <div className="space-y-3 w-full max-w-[200px]">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Inflows
                  </span>
                  <span className="text-white font-mono">{depositPct.toFixed(1)}%</span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">{formatINR(stats.total_deposits)}</div>
                <div className="text-[11px] text-slate-500">{stats.deposit_count} credits</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Outflows
                  </span>
                  <span className="text-white font-mono">{withdrawalPct.toFixed(1)}%</span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-1">{formatINR(stats.total_withdrawals)}</div>
                <div className="text-[11px] text-slate-500">{stats.withdrawal_count} debits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Monthly Net Cash Flow Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                3. Monthly Net Cash-Flow Chart
              </h2>
              <p className="text-xs text-slate-400">Divergent cash-flow bars (+ surplus / - deficit)</p>
            </div>
          </div>

          <div className="h-64 flex flex-col justify-between pt-4">
            <div className="relative h-48 w-full border-b border-slate-800 flex items-center px-2 pb-2">
              <div className="absolute left-0 right-0 top-1/2 border-t border-slate-700/80 -translate-y-1/2 pointer-events-none" />

              <div className="flex items-center gap-3 w-full h-full">
                {filteredTrends.map((item, idx) => {
                  const isPositive = item.net_flow >= 0;
                  const barH = maxNetFlowAbs > 0 ? (Math.abs(item.net_flow) / maxNetFlowAbs) * 75 : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-center group relative">
                      <div className="absolute -top-10 bg-slate-950 border border-slate-700 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                        <p className="font-bold">{item.month_name}</p>
                        <p className={isPositive ? 'text-cyan-400' : 'text-rose-400'}>
                          Net Flow: {formatINR(item.net_flow)}
                        </p>
                      </div>

                      <div className="h-full w-full flex flex-col justify-center items-center">
                        <div className="h-1/2 flex items-end justify-center w-full">
                          {isPositive && (
                            <div
                              style={{ height: `${Math.max(barH, item.net_flow > 0 ? 4 : 0)}px` }}
                              className="w-1/2 max-w-[20px] bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t-sm"
                            />
                          )}
                        </div>
                        <div className="h-1/2 flex items-start justify-center w-full">
                          {!isPositive && (
                            <div
                              style={{ height: `${Math.max(barH, 4)}px` }}
                              className="w-1/2 max-w-[20px] bg-gradient-to-b from-rose-500 to-red-600 rounded-b-sm"
                            />
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                        {item.month_name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-cyan-400" />
                <span>Net Surplus (+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-500" />
                <span>Net Deficit (-)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Account Balance Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                4. Account Balance Trend Chart
              </h2>
              <p className="text-xs text-slate-400">Cumulative month-end liquidity trajectory</p>
            </div>
          </div>

          <div className="h-64 flex flex-col justify-between pt-4">
            <div className="relative h-48 w-full border-b border-slate-800 px-2 pb-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {(() => {
                  const points = filteredTrends;
                  const maxBal = Math.max(...points.map((p) => p.closing_balance), 1000);
                  const stepX = points.length > 1 ? 500 / (points.length - 1) : 250;

                  const coords = points.map((p, i) => {
                    const x = i * stepX;
                    const y = 150 - (p.closing_balance / maxBal) * 130;
                    return { x, y, p };
                  });

                  const pathD = coords.reduce((acc, curr, i) => {
                    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                  }, '');

                  const areaD = `${pathD} L 500 150 L 0 150 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#balanceGrad)" />
                      <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
                      {coords.map((c, i) => (
                        <circle key={i} cx={c.x} cy={c.y} r="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-2 px-1">
              {filteredTrends.map((m, i) => (
                <span key={i}>{m.month_name.split(' ')[0]}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Composite SVG for direct image download */}
      <div className="hidden">
        <svg id="analytics-composite-chart" width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="500" fill="#0f172a" />
          <text x="40" y="50" fill="#ffffff" fontSize="22" fontFamily="sans-serif" fontWeight="bold">
            Banklytics Financial Analytics — Account #{accountNumber}
          </text>
          <text x="40" y="80" fill="#94a3b8" fontSize="13" fontFamily="sans-serif">
            Total Inflows: {formatINR(stats.total_deposits)} | Total Outflows: {formatINR(stats.total_withdrawals)} | Net: {formatINR(stats.net_balance_change)}
          </text>
          <line x1="40" y1="100" x2="760" y2="100" stroke="#334155" strokeWidth="1" />
          {filteredTrends.map((item, idx) => {
            const x = 60 + idx * 110;
            const maxVal = maxDepositWithdraw || 1000;
            const dH = (item.deposits / maxVal) * 220;
            const wH = (item.withdrawals / maxVal) * 220;
            return (
              <g key={idx}>
                <rect x={x} y={380 - dH} width="35" height={Math.max(dH, 2)} fill="#10b981" rx="3" />
                <rect x={x + 40} y={380 - wH} width="35" height={Math.max(wH, 2)} fill="#f43f5e" rx="3" />
                <text x={x + 35} y="415" fill="#94a3b8" fontSize="12" fontFamily="sans-serif" textAnchor="middle">
                  {item.month_name}
                </text>
              </g>
            );
          })}
          <line x1="40" y1="385" x2="760" y2="385" stroke="#475569" strokeWidth="1" />
          <text x="40" y="460" fill="#64748b" fontSize="11" fontFamily="sans-serif">
            Banklytics Python & Pandas Analytics Engine. Academic Project 16.
          </text>
        </svg>
      </div>
    </div>
  );
};
