"""
Rule-Based Unusual Transaction Review Flagging Engine
Educational Heuristic Rules (NOT machine learning or fraud accusations).
"""

import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from flask import current_app
from app import db
from app.models import Transaction, TransactionFlag


def evaluate_transaction_rules(transaction: Transaction):
    """
    Evaluates rule-based anomaly flags deterministically upon transaction recording.
    """
    flags_to_add = []

    # Rule 1: High Single Transaction Amount Threshold (>= 25,000)
    threshold = Decimal(str(current_app.config.get("ANOMALY_HIGH_VALUE_THRESHOLD", 25000.00)))
    if transaction.amount >= threshold:
        flag = TransactionFlag(
            flag_id=f"FLG-{uuid.uuid4().hex[:10].upper()}",
            transaction_id=transaction.transaction_id,
            rule_name="HIGH_VALUE_THRESHOLD",
            reason=f"Transaction amount of ₹{transaction.amount:,.2f} meets or exceeds the educational threshold of ₹{threshold:,.2f}.",
            review_status="PENDING_REVIEW"
        )
        flags_to_add.append(flag)

    # Rule 2: Rapid Successive Withdrawals Velocity (3+ withdrawals in 60 mins)
    if transaction.transaction_type == "WITHDRAWAL":
        one_hour_ago = transaction.transaction_date - timedelta(hours=1)
        recent_withdrawals = Transaction.query.filter(
            Transaction.account_id == transaction.account_id,
            Transaction.transaction_type == "WITHDRAWAL",
            Transaction.transaction_date >= one_hour_ago
        ).all()

        if len(recent_withdrawals) >= 3:
            flag = TransactionFlag(
                flag_id=f"FLG-{uuid.uuid4().hex[:10].upper()}",
                transaction_id=transaction.transaction_id,
                rule_name="RAPID_WITHDRAWALS_VELOCITY",
                reason=f"Account recorded {len(recent_withdrawals)} withdrawals within a rolling 60-minute window.",
                review_status="PENDING_REVIEW"
            )
            flags_to_add.append(flag)

    # Rule 3: Historical Deviation Spike (> 3x historical mean with at least 3 transactions)
    prior_txns = Transaction.query.filter(
        Transaction.account_id == transaction.account_id,
        Transaction.transaction_id != transaction.transaction_id
    ).all()

    if len(prior_txns) >= 3:
        avg_amount = sum([t.amount for t in prior_txns]) / len(prior_txns)
        if transaction.amount > (avg_amount * Decimal("3.0")) and transaction.amount > Decimal("5000.00"):
            flag = TransactionFlag(
                flag_id=f"FLG-{uuid.uuid4().hex[:10].upper()}",
                transaction_id=transaction.transaction_id,
                rule_name="HISTORICAL_DEVIATION_SPIKE",
                reason=f"Transaction amount (₹{transaction.amount:,.2f}) exceeds 3x the account's historical average size (₹{avg_amount:,.2f}).",
                review_status="PENDING_REVIEW"
            )
            flags_to_add.append(flag)

    for f in flags_to_add:
        db.session.add(f)
    if flags_to_add:
        db.session.commit()
