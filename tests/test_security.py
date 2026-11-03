"""
Tests for Rule-based Anomaly Engine, Access Authorization, and Password Security
"""

from decimal import Decimal
from werkzeug.security import check_password_hash
from app.models import Customer, Account, TransactionFlag
from app.services.banking_service import process_deposit, process_withdrawal


def test_password_securely_hashed(app):
    with app.app_context():
        cust = Customer.query.filter_by(username="demouser1").first()
        # Verify password is stored as hash, not plain text
        assert cust.password_hash != "Demo@1001"
        assert cust.password_hash.startswith("scrypt:") or cust.password_hash.startswith("pbkdf2:")
        assert cust.check_password("Demo@1001") is True
        assert cust.check_password("WrongPass") is False


def test_rule_high_value_threshold_triggers_flag(app):
    with app.app_context():
        # Deposit ₹30,000 (exceeds default ₹25,000 threshold)
        success, msg, txn = process_deposit("1001", "30000.00", "Large grant deposit")
        assert success is True

        flags = TransactionFlag.query.filter_by(transaction_id=txn.transaction_id).all()
        assert len(flags) >= 1
        rule_names = [f.rule_name for f in flags]
        assert "HIGH_VALUE_THRESHOLD" in rule_names
        assert flags[0].review_status == "PENDING_REVIEW"


def test_rule_velocity_triggers_flag(app):
    with app.app_context():
        # Prepare sufficient funds
        process_deposit("1002", "50000.00", "Initial funds")

        # Perform 3 rapid withdrawals
        process_withdrawal("1002", "100.00", "Withdrawal 1")
        process_withdrawal("1002", "200.00", "Withdrawal 2")
        _, _, txn3 = process_withdrawal("1002", "300.00", "Withdrawal 3")

        flags = TransactionFlag.query.filter_by(transaction_id=txn3.transaction_id).all()
        rule_names = [f.rule_name for f in flags]
        assert "RAPID_WITHDRAWALS_VELOCITY" in rule_names


def test_authorization_user_data_isolation(client, app):
    """Verify that user 1 cannot update flags belonging to user 2."""
    with app.app_context():
        # Generate flag for Customer 2 (Account #1002)
        _, _, txn = process_deposit("1002", "35000.00", "Customer 2 High Value")
        flag = TransactionFlag.query.filter_by(transaction_id=txn.transaction_id).first()
        flag_id = flag.flag_id

    # Log in as Demo Customer 1
    client.post("/login", data={"identifier": "demouser1", "password": "Demo@1001"})

    # Attempt to update Customer 2's flag
    response = client.post(f"/flags/{flag_id}/update", data={"status": "REVIEWED"}, follow_redirects=True)
    assert b"Unauthorized action" in response.data

    # Verify status did not change
    with app.app_context():
        flag = TransactionFlag.query.get(flag_id)
        assert flag.review_status == "PENDING_REVIEW"
