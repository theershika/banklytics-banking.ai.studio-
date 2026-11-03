import { Transaction, MonthlySummary, AnalyticsStats } from '../types/banking';

export function formatINR(val: number): string {
  return '₹' + Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatUTCDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return isoString;
  }
}

export function exportTransactionsToCSV(transactions: Transaction[], accountNumber: string) {
  const headers = ['Transaction ID', 'Date (UTC)', 'Account Number', 'Type', 'Amount (INR)', 'Description', 'Balance After (INR)'];
  const rows = transactions.map((t) => [
    `"${t.transaction_id}"`,
    `"${formatUTCDate(t.transaction_date)}"`,
    `"${t.account_number}"`,
    `"${t.transaction_type}"`,
    t.amount.toFixed(2),
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.balance_after.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  downloadBlob(csvContent, `AccountPulse_Statement_Acct_${accountNumber}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportMonthlyReportToCSV(summary: MonthlySummary, transactions: Transaction[], accountNumber: string) {
  const meta = [
    ['AccountPulse Banking Simulation - Monthly Statement'],
    [`Account Number`, accountNumber],
    [`Statement Period`, summary.month_name],
    [`Opening Balance`, `INR ${summary.opening_balance.toFixed(2)}`],
    [`Total Deposits`, `INR ${summary.total_deposits.toFixed(2)}`],
    [`Total Withdrawals`, `INR ${summary.total_withdrawals.toFixed(2)}`],
    [`Net Cash Flow`, `INR ${summary.net_change.toFixed(2)}`],
    [`Closing Balance`, `INR ${summary.closing_balance.toFixed(2)}`],
    [`Transaction Count`, summary.transaction_count.toString()],
    [],
    ['Itemized Monthly Transactions:'],
    ['Transaction ID', 'Date (UTC)', 'Type', 'Amount (INR)', 'Description', 'Balance After (INR)'],
  ];

  const txnRows = transactions.map((t) => [
    `"${t.transaction_id}"`,
    `"${formatUTCDate(t.transaction_date)}"`,
    `"${t.transaction_type}"`,
    t.amount.toFixed(2),
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.balance_after.toFixed(2),
  ]);

  const allLines = [...meta.map((m) => m.join(',')), ...txnRows.map((r) => r.join(','))];
  const csvContent = allLines.join('\r\n');
  downloadBlob(csvContent, `AccountPulse_MonthlyReport_${accountNumber}_${summary.year}_${summary.month}.csv`, 'text/csv;charset=utf-8;');
}

export function exportAnalyticsToCSV(stats: AnalyticsStats, accountNumber: string) {
  const lines = [
    ['AccountPulse Financial Analytics Summary'],
    [`Account Number`, accountNumber],
    [`Generated Date`, new Date().toISOString()],
    [],
    ['Key Metric', 'Value (INR)'],
    ['Total Deposits', stats.total_deposits.toFixed(2)],
    ['Total Withdrawals', stats.total_withdrawals.toFixed(2)],
    ['Net Balance Change', stats.net_balance_change.toFixed(2)],
    ['Total Transaction Count', stats.transaction_count.toString()],
    ['Deposit Count', stats.deposit_count.toString()],
    ['Withdrawal Count', stats.withdrawal_count.toString()],
    ['Average Transaction Size', stats.average_transaction.toFixed(2)],
    ['Highest Deposit', stats.highest_deposit.toFixed(2)],
    ['Highest Withdrawal', stats.highest_withdrawal.toFixed(2)],
    [],
    ['Monthly Breakdown:'],
    ['Month', 'Deposits (INR)', 'Withdrawals (INR)', 'Net Flow (INR)', 'Closing Balance (INR)'],
  ];

  for (const t of stats.monthly_trends) {
    lines.push([t.month_name, t.deposits.toFixed(2), t.withdrawals.toFixed(2), t.net_flow.toFixed(2), t.closing_balance.toFixed(2)]);
  }

  const csvContent = lines.map((l) => l.join(',')).join('\r\n');
  downloadBlob(csvContent, `AccountPulse_Analytics_${accountNumber}.csv`, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
