"""
Database Models for Banklytics
Enforcing DECIMAL(15,2) monetary precision and relational integrity.
"""

from datetime import datetime, timezone
from decimal import Decimal
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class Customer(UserMixin, db.Model):
    __tablename__ = "customers"

    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="CUSTOMER", nullable=False)  # 'CUSTOMER' or 'ADMIN'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    accounts = db.relationship("Account", backref="customer", cascade="all, delete-orphan", lazy=True)

    def get_id(self):
        return str(self.customer_id)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self) -> bool:
        return self.role == "ADMIN"


class Account(db.Model):
    __tablename__ = "accounts"

    account_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    account_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.customer_id"), nullable=False)
    account_type = db.Column(db.String(20), default="Savings", nullable=False)
    # DECIMAL(15,2) strictly enforced for monetary values
    balance = db.Column(db.Numeric(precision=15, scale=2), default=Decimal("0.00"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    transactions = db.relationship("Transaction", backref="account", cascade="all, delete-orphan", lazy=True)


class Transaction(db.Model):
    __tablename__ = "transactions"

    transaction_id = db.Column(db.String(40), primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.account_id"), nullable=False, index=True)
    transaction_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    transaction_type = db.Column(db.String(15), nullable=False)  # 'DEPOSIT' or 'WITHDRAWAL'
    amount = db.Column(db.Numeric(precision=15, scale=2), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    balance_after = db.Column(db.Numeric(precision=15, scale=2), nullable=False)

    flags = db.relationship("TransactionFlag", backref="transaction", cascade="all, delete-orphan", lazy=True)


class TransactionFlag(db.Model):
    __tablename__ = "transaction_flags"

    flag_id = db.Column(db.String(40), primary_key=True)
    transaction_id = db.Column(db.String(40), db.ForeignKey("transactions.transaction_id"), nullable=False, index=True)
    rule_name = db.Column(db.String(60), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    review_status = db.Column(db.String(25), default="PENDING_REVIEW", nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
