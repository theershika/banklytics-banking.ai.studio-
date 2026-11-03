"""
Reporting Service: Monthly Statements, Balance Reconciliation, and CSV Generation
"""

import io
import csv
from datetime import datetime, timezone
from decimal import Decimal
from app.models import Transaction, Account


def get_monthly_statement(account_number: str, year: int, month: int) -> dict:
    """
    Computes exact monthly statement metrics:
    opening balance, total deposits, total withdrawals, closing balance, net change.
    """
    account = Account.query.filter_by(account_number=account_number).first()
    if not account:
        return {}

    # Define boundary timestamps in UTC
    start_dt = datetime(year, month, 1, 0, 0, 0, tzinfo=timezone.utc)
    if month == 12:
        end_dt = datetime(year + 1, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    else:
        end_dt = datetime(year, month + 1, 1, 0, 0, 0, tzinfo=timezone.utc)

    # Opening balance: last transaction balance before start_dt
    last_prior_txn = (
        Transaction.query.filter(
            Transaction.account_id == account.account_id,
            Transaction.transaction_date < start_dt
        )
        .order_by(Transaction.transaction_date.desc())
        .first()
    )
    opening_balance = last_prior_txn.balance_after if last_prior_txn else Decimal("0.00")

    # Transactions in selected month
    monthly_txns = (
        Transaction.query.filter(
            Transaction.account_id == account.account_id,
            Transaction.transaction_date >= start_dt,
            Transaction.transaction_date < end_dt
        )
        .order_by(Transaction.transaction_date.asc())
        .all()
    )

    total_deposits = sum([t.amount for t in monthly_txns if t.transaction_type == "DEPOSIT"])
    total_withdrawals = sum([t.amount for t in monthly_txns if t.transaction_type == "WITHDRAWAL"])
    net_change = total_deposits - total_withdrawals

    closing_balance = monthly_txns[-1].balance_after if monthly_txns else opening_balance

    month_name = start_dt.strftime("%B %Y")

    return {
        "year": year,
        "month": month,
        "month_name": month_name,
        "opening_balance": opening_balance,
        "total_deposits": total_deposits,
        "total_withdrawals": total_withdrawals,
        "closing_balance": closing_balance,
        "net_change": net_change,
        "transaction_count": len(monthly_txns),
        "transactions": list(reversed(monthly_txns))  # Newest first for presentation
    }


def generate_transactions_csv(transactions: list[Transaction], account_number: str) -> io.StringIO:
    """Exports transaction history to an RFC-4180 compliant CSV stream."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Transaction ID",
        "Date (UTC)",
        "Account Number",
        "Transaction Type",
        "Amount (INR)",
        "Description",
        "Balance After (INR)"
    ])

    for t in transactions:
        writer.writerow([
            t.transaction_id,
            t.transaction_date.strftime("%Y-%m-%d %H:%M:%S UTC"),
            account_number,
            t.transaction_type,
            f"{t.amount:.2f}",
            t.description or "",
            f"{t.balance_after:.2f}"
        ])

    output.seek(0)
    return output
