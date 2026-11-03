"""
Tests for Atomic Deposits, Withdrawals, Overdraft Guards, and Monetary Precision
"""

from decimal import Decimal
from app import db
from app.models import Account, Transaction
from app.services.banking_service import process_deposit, process_withdrawal


def test_deposit_updates_balance(app):
    with app.app_context():
        success, msg, txn = process_deposit("1001", "5000.75", "Stipend credit")
        assert success is True
        assert txn.amount == Decimal("5000.75")
        assert txn.balance_after == Decimal("5000.75")

        acct = Account.query.filter_by(account_number="1001").first()
        assert acct.balance == Decimal("5000.75")


def test_withdrawal_updates_balance(app):
    with app.app_context():
        # First deposit funds
        process_deposit("1001", "3000.00", "Initial deposit")
        # Then withdraw
        success, msg, txn = process_withdrawal("1001", "1250.50", "Office rent")
        assert success is True
        assert txn.amount == Decimal("1250.50")
        assert txn.balance_after == Decimal("1749.50")

        acct = Account.query.filter_by(account_number="1001").first()
        assert acct.balance == Decimal("1749.50")


def test_insufficient_balance_rejected(app):
    with app.app_context():
        acct = Account.query.filter_by(account_number="1002").first()
        assert acct.balance == Decimal("0.00")

        # Attempt to withdraw from empty account
        success, msg, txn = process_withdrawal("1002", "100.00", "Attempted overdraft")
        assert success is False
        assert "Insufficient funds" in msg
        assert txn is None

        # Ensure balance is still 0.00
        acct = Account.query.filter_by(account_number="1002").first()
        assert acct.balance == Decimal("0.00")


def test_zero_and_negative_amounts_rejected(app):
    with app.app_context():
        # Zero deposit
        s1, m1, _ = process_deposit("1001", "0.00")
        assert s1 is False
        assert "greater than" in m1

        # Negative deposit
        s2, m2, _ = process_deposit("1001", "-500.00")
        assert s2 is False

        # Zero withdrawal
        s3, m3, _ = process_withdrawal("1001", "0.00")
        assert s3 is False

        # Negative withdrawal
        s4, m4, _ = process_withdrawal("1001", "-250.00")
        assert s4 is False


def test_invalid_amount_formats_rejected(app):
    with app.app_context():
        s, m, _ = process_deposit("1001", "abc_invalid")
        assert s is False
        assert "Invalid monetary format" in m


def test_monetary_precision_preserved(app):
    with app.app_context():
        # 0.1 + 0.2 floating point anomaly check: in Decimal it must be exact 0.30
        process_deposit("1003", "0.10")
        process_deposit("1003", "0.20")

        acct = Account.query.filter_by(account_number="1003").first()
        assert acct.balance == Decimal("0.30")
        assert str(acct.balance) == "0.30"


def test_transaction_history_accuracy(app):
    with app.app_context():
        process_deposit("1004", "1000.00", "Txn 1")
        process_deposit("1004", "500.00", "Txn 2")
        process_withdrawal("1004", "200.00", "Txn 3")

        acct = Account.query.filter_by(account_number="1004").first()
        txns = Transaction.query.filter_by(account_id=acct.account_id).order_by(Transaction.transaction_date.asc()).all()
        assert len(txns) == 3
        assert txns[0].balance_after == Decimal("1000.00")
        assert txns[1].balance_after == Decimal("1500.00")
        assert txns[2].balance_after == Decimal("1300.00")
