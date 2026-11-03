"""
Tests for Pandas & NumPy Analytics Service and Monthly Statements
"""

from decimal import Decimal
from datetime import datetime, timezone
from app.services.banking_service import process_deposit, process_withdrawal
from app.services.analytics_service import calculate_account_analytics
from app.services.reporting_service import get_monthly_statement


def test_empty_account_analytics(app):
    with app.app_context():
        stats = calculate_account_analytics("1005")
        assert stats["total_deposits"] == Decimal("0.00")
        assert stats["total_withdrawals"] == Decimal("0.00")
        assert stats["net_balance_change"] == Decimal("0.00")
        assert stats["transaction_count"] == 0
        assert stats["average_transaction"] == Decimal("0.00")


def test_pandas_analytics_calculations(app):
    with app.app_context():
        # Setup multi-transaction ledger
        process_deposit("1001", "10000.00", "Consulting")
        process_deposit("1001", "5000.00", "Stipend")
        process_withdrawal("1001", "2000.00", "Server")
        process_withdrawal("1001", "1000.00", "Books")

        stats = calculate_account_analytics("1001")
        assert stats["total_deposits"] == Decimal("15000.00")
        assert stats["total_withdrawals"] == Decimal("3000.00")
        assert stats["net_balance_change"] == Decimal("12000.00")
        assert stats["transaction_count"] == 4
        assert stats["deposit_count"] == 2
        assert stats["withdrawal_count"] == 2
        assert stats["highest_deposit"] == Decimal("10000.00")
        assert stats["highest_withdrawal"] == Decimal("2000.00")
        # Average: (10000 + 5000 + 2000 + 1000) / 4 = 4500.00
        assert stats["average_transaction"] == Decimal("4500.00")


def test_monthly_statement_reconciliation(app):
    with app.app_context():
        now = datetime.now(timezone.utc)
        process_deposit("1002", "8000.00", "Income")
        process_withdrawal("1002", "1500.00", "Expense")

        statement = get_monthly_statement("1002", now.year, now.month)
        assert statement["total_deposits"] == Decimal("8000.00")
        assert statement["total_withdrawals"] == Decimal("1500.00")
        assert statement["closing_balance"] == Decimal("6500.00")
        assert statement["net_change"] == Decimal("6500.00")
        assert statement["transaction_count"] == 2
