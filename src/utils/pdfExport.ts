import { jsPDF } from 'jspdf';
import { Transaction, MonthlySummary } from '../types/banking';
import { formatINR, formatUTCDate } from './exportUtils';

export function generateTransactionReceiptPDF(
  txn: Transaction,
  customerName: string,
  accountType: string = 'Savings'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const isDeposit = txn.transaction_type === 'DEPOSIT';

  // Background card styling
  doc.setFillColor(15, 23, 42); // Navy slate
  doc.rect(0, 0, 148, 210, 'F');

  // Decorative border
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.8);
  doc.roundedRect(8, 8, 132, 194, 4, 4, 'S');

  // Watermark
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SIMULATION RECEIPT — NOT A REAL BANK', 74, 110, {
    align: 'center',
    angle: 45,
  });

  // Header Brand
  doc.setTextColor(6, 182, 212); // Cyan
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BANKLYTICS', 74, 24, { align: 'center' });

  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Banking. Smarter Insights.', 74, 29, { align: 'center' });
  doc.text('OFFICIAL SIMULATED TRANSACTION VOUCHER', 74, 34, { align: 'center' });

  // Divider
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.4);
  doc.line(16, 38, 132, 38);

  // Status Badge box
  if (isDeposit) {
    doc.setFillColor(16, 185, 129); // Green
    doc.rect(49, 44, 50, 7, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CREDIT SUCCESSFUL', 74, 49, { align: 'center' });
  } else {
    doc.setFillColor(244, 63, 94); // Rose
    doc.rect(49, 44, 50, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DEBIT SUCCESSFUL', 74, 49, { align: 'center' });
  }

  // Amount Highlight
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const amountStr = `${isDeposit ? '+' : '-'}${formatINR(txn.amount)}`;
  doc.text(amountStr, 74, 63, { align: 'center' });

  // Receipt details table container
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(16, 72, 116, 95, 3, 3, 'F');

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);

  const fields = [
    { label: 'Transaction Reference', value: txn.transaction_id },
    { label: 'Account Holder', value: customerName },
    { label: 'Account Number', value: `#${txn.account_number} (${accountType})` },
    { label: 'Date & Time (UTC)', value: formatUTCDate(txn.transaction_date) },
    { label: 'Transaction Type', value: txn.transaction_type },
    { label: 'Description / Memo', value: txn.description || 'Simulated Transfer' },
    { label: 'Balance After Transaction', value: formatINR(txn.balance_after) },
    { label: 'Ledger Authorization', value: 'VERIFIED (ACID COMPLIANT)' },
  ];

  let startY = 82;
  fields.forEach((f) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(f.label, 22, startY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(241, 245, 249);
    doc.text(f.value, 126, startY, { align: 'right' });
    startY += 10.5;
  });

  // Footer Disclaimer
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Academic Project 16 — Banking Transaction Analysis System', 74, 180, { align: 'center' });
  doc.text('This voucher was generated in an educational simulation. No real money was exchanged.', 74, 184, { align: 'center' });
  doc.text(`Generated: ${new Date().toISOString()}`, 74, 188, { align: 'center' });

  doc.save(`Banklytics_Receipt_${txn.transaction_id}.pdf`);
}

export function generateMonthlyStatementPDF(
  summary: MonthlySummary,
  transactions: Transaction[],
  customerName: string,
  accountNumber: string,
  accountType: string = 'Savings'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header background
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 42, 'F');

  // Watermark across center
  doc.setTextColor(230, 235, 245);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATIONAL SIMULATION — NOT A REAL BANK STATEMENT', 105, 150, {
    align: 'center',
    angle: 45,
  });

  // Logo & Title
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BANKLYTICS', 18, 20);

  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Banking. Smarter Insights.', 18, 26);
  doc.text('Retail Banking Simulation & Transaction Analysis Ledger', 18, 31);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTHLY ACCOUNT STATEMENT', 192, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.text(`Statement Period: ${summary.month_name}`, 192, 27, { align: 'right' });
  doc.text(`Generated: ${new Date().toISOString().slice(0, 10)} UTC`, 192, 33, { align: 'right' });

  // Customer & Account Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(18, 48, 174, 22, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ACCOUNT HOLDER', 24, 55);
  doc.text('ACCOUNT NUMBER', 80, 55);
  doc.text('ACCOUNT TYPE', 135, 55);
  doc.text('CURRENCY', 170, 55);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(customerName, 24, 63);
  doc.text(`#${accountNumber}`, 80, 63);
  doc.text(accountType, 135, 63);
  doc.text('INR (₹)', 170, 63);

  // Financial Summary Cards Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(18, 75, 174, 24, 2, 2, 'F');

  const summaryBoxes = [
    { label: 'OPENING BALANCE', value: formatINR(summary.opening_balance), color: [15, 23, 42] },
    { label: 'TOTAL DEPOSITS', value: `+${formatINR(summary.total_deposits)}`, color: [16, 185, 129] },
    { label: 'TOTAL WITHDRAWALS', value: `-${formatINR(summary.total_withdrawals)}`, color: [244, 63, 94] },
    { label: 'NET CASH FLOW', value: formatINR(summary.net_change), color: summary.net_change >= 0 ? [6, 182, 212] : [244, 63, 94] },
    { label: 'CLOSING BALANCE', value: formatINR(summary.closing_balance), color: [15, 23, 42] },
  ];

  const colWidth = 174 / 5;
  summaryBoxes.forEach((b, i) => {
    const x = 18 + i * colWidth + colWidth / 2;
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(b.label, x, 82, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(b.value, x, 91, { align: 'center' });
  });

  // Transactions Table Header
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Itemized Transactions (${transactions.length} operations)`, 18, 108);

  doc.setFillColor(15, 23, 42);
  doc.rect(18, 112, 174, 8, 'F');

  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE (UTC)', 22, 117);
  doc.text('REFERENCE ID', 55, 117);
  doc.text('TYPE', 90, 117);
  doc.text('DESCRIPTION', 115, 117);
  doc.text('AMOUNT', 160, 117, { align: 'right' });
  doc.text('BALANCE AFTER', 188, 117, { align: 'right' });

  // Transaction Rows
  let curY = 125;
  doc.setFont('helvetica', 'normal');

  if (transactions.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('No transaction activity recorded during this calendar period.', 105, 135, { align: 'center' });
  } else {
    transactions.slice(0, 18).forEach((t, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(18, curY - 4, 174, 7, 'F');
      }

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(formatUTCDate(t.transaction_date).slice(0, 10), 22, curY);

      doc.setTextColor(15, 23, 42);
      doc.text(t.transaction_id, 55, curY);

      if (t.transaction_type === 'DEPOSIT') {
        doc.setTextColor(16, 185, 129);
        doc.setFont('helvetica', 'bold');
        doc.text('DEPOSIT', 90, curY);
      } else {
        doc.setTextColor(244, 63, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('WITHDRAWAL', 90, curY);
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text((t.description || '').slice(0, 24), 115, curY);

      doc.setFont('helvetica', 'bold');
      if (t.transaction_type === 'DEPOSIT') {
        doc.setTextColor(16, 185, 129);
        doc.text(`+${formatINR(t.amount)}`, 160, curY, { align: 'right' });
      } else {
        doc.setTextColor(244, 63, 94);
        doc.text(`-${formatINR(t.amount)}`, 160, curY, { align: 'right' });
      }

      doc.setTextColor(15, 23, 42);
      doc.text(formatINR(t.balance_after), 188, curY, { align: 'right' });

      curY += 7.5;
    });
  }

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(18, 280, 192, 280);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('BANKLYTICS: Academic Project 16 — Banking Transaction Analysis System', 18, 285);
  doc.text('WATERMARK: EDUCATIONAL SIMULATION — NOT A REAL BANK STATEMENT', 192, 285, { align: 'right' });

  doc.save(`Banklytics_Statement_${accountNumber}_${summary.year}_${String(summary.month).padStart(2, '0')}.pdf`);
}
