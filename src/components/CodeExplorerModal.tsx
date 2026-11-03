import React, { useState } from 'react';
import { X, Terminal, FileCode, Check, Copy, BookOpen, Layers, Database } from 'lucide-react';

interface CodeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExplorerModal: React.FC<CodeExplorerModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('run.py');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files: Record<string, { desc: string; code: string }> = {
    'run.py': {
      desc: 'Main Application Entry Point (Flask dev server & database bootstrapper)',
      code: `"""
AccountPulse - Banking Transaction Analysis System
Academic Project 16
Entry point to run local Flask server on http://127.0.0.1:5000
"""
import os
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

from app import create_app, db
from app.models import Customer, Account
from app.services.banking_service import seed_initial_demo_accounts

app = create_app()

@app.cli.command("init-db")
def init_db_command():
    """Create missing database tables and seed 5 initial demo accounts safely."""
    with app.app_context():
        db.create_all()
        seed_initial_demo_accounts()
        print("Initialized MySQL banking_analysis tables and confirmed 5 demo accounts.")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    print(f"\\n=======================================================")
    print(f" AccountPulse Banking Transaction Analysis System")
    print(f" Local Web Server Running: http://127.0.0.1:{port}")
    print(f" Demo Accounts: 1001 to 1005 (Default password: Demo@1001..1005)")
    print(f"=======================================================\\n")
    app.run(host="0.0.0.0", port=port, debug=debug)`,
    },
    'app/models.py': {
      desc: 'SQLAlchemy ORM Models (DECIMAL(15,2), Foreign Keys, UTC Timestamps)',
      code: `"""
Database Models for AccountPulse
Enforcing DECIMAL(15,2) monetary safety and relational constraints.
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
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # One customer has one or more accounts
    accounts = db.relationship("Account", backref="customer", cascade="all, delete-orphan", lazy=True)

    def get_id(self):
        return str(self.customer_id)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class Account(db.Model):
    __tablename__ = "accounts"

    account_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    account_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.customer_id"), nullable=False)
    account_type = db.Column(db.String(20), default="Savings", nullable=False)
    # DECIMAL(15,2) strictly enforced for currency
    balance = db.Column(db.Numeric(precision=15, scale=2), default=Decimal("0.00"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    transactions = db.relationship("Transaction", backref="account", cascade="all, delete-orphan", lazy=True)


class Transaction(db.Model):
    __tablename__ = "transactions"

    transaction_id = db.Column(db.String(36), primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.account_id"), nullable=False)
    transaction_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    transaction_type = db.Column(db.String(10), nullable=False) # 'DEPOSIT' or 'WITHDRAWAL'
    amount = db.Column(db.Numeric(precision=15, scale=2), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    balance_after = db.Column(db.Numeric(precision=15, scale=2), nullable=False)

    flags = db.relationship("TransactionFlag", backref="transaction", cascade="all, delete-orphan", lazy=True)


class TransactionFlag(db.Model):
    __tablename__ = "transaction_flags"

    flag_id = db.Column(db.String(36), primary_key=True)
    transaction_id = db.Column(db.String(36), db.ForeignKey("transactions.transaction_id"), nullable=False)
    rule_name = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    review_status = db.Column(db.String(20), default="PENDING_REVIEW") # PENDING_REVIEW, REVIEWED, DISMISSED
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))`,
    },
    'app/services/analytics_service.py': {
      desc: 'Pandas & NumPy Analytics Engine (Monthly Aggregations & Trends)',
      code: `"""
Analytics Service using Pandas and NumPy
Aggregates ledger transactions into monthly summaries, net cash flows, and statistical distributions.
"""
from decimal import Decimal
import pandas as pd
import numpy as np
from app.models import Transaction, Account

def calculate_account_analytics(account_number: str) -> dict:
    """Uses Pandas DataFrame to compute high-performance ledger statistics."""
    account = Account.query.filter_by(account_number=account_number).first()
    if not account:
        return {}

    transactions = Transaction.query.filter_by(account_id=account.account_id).order_by(Transaction.transaction_date.asc()).all()

    if not transactions:
        return {
            "total_deposits": Decimal("0.00"),
            "total_withdrawals": Decimal("0.00"),
            "net_balance_change": Decimal("0.00"),
            "transaction_count": 0,
            "deposit_count": 0,
            "withdrawal_count": 0,
            "average_transaction": Decimal("0.00"),
            "highest_deposit": Decimal("0.00"),
            "highest_withdrawal": Decimal("0.00"),
            "monthly_trends": []
        }

    # Convert SQLAlchemy records to Pandas DataFrame
    records = [{
        "transaction_id": t.transaction_id,
        "date": t.transaction_date,
        "type": t.transaction_type,
        "amount": float(t.amount),
        "balance_after": float(t.balance_after)
    } for t in transactions]

    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"])
    df["month_year"] = df["date"].dt.to_period("M").astype(str)

    # Filter deposits and withdrawals
    deposits_df = df[df["type"] == "DEPOSIT"]
    withdrawals_df = df[df["type"] == "WITHDRAWAL"]

    total_deposits = float(deposits_df["amount"].sum()) if not deposits_df.empty else 0.0
    total_withdrawals = float(withdrawals_df["amount"].sum()) if not withdrawals_df.empty else 0.0
    net_flow = total_deposits - total_withdrawals

    avg_txn = float(df["amount"].mean()) if not df.empty else 0.0
    highest_dep = float(deposits_df["amount"].max()) if not deposits_df.empty else 0.0
    highest_with = float(withdrawals_df["amount"].max()) if not withdrawals_df.empty else 0.0

    # Monthly Grouping
    monthly_groups = []
    unique_months = df["month_year"].unique()
    for m in sorted(unique_months):
        m_df = df[df["month_year"] == m]
        m_dep = float(m_df[m_df["type"] == "DEPOSIT"]["amount"].sum()) if not m_df[m_df["type"] == "DEPOSIT"].empty else 0.0
        m_with = float(m_df[m_df["type"] == "WITHDRAWAL"]["amount"].sum()) if not m_df[m_df["type"] == "WITHDRAWAL"].empty else 0.0
        closing = float(m_df.iloc[-1]["balance_after"])
        monthly_groups.append({
            "month": m,
            "deposits": m_dep,
            "withdrawals": m_with,
            "net_flow": m_dep - m_with,
            "closing_balance": closing
        })

    return {
        "total_deposits": round(total_deposits, 2),
        "total_withdrawals": round(total_withdrawals, 2),
        "net_balance_change": round(net_flow, 2),
        "transaction_count": len(df),
        "deposit_count": len(deposits_df),
        "withdrawal_count": len(withdrawals_df),
        "average_transaction": round(avg_txn, 2),
        "highest_deposit": round(highest_dep, 2),
        "highest_withdrawal": round(highest_with, 2),
        "monthly_trends": monthly_groups
    }`,
    },
    'tests/test_banking.py': {
      desc: 'pytest Test Suite (Atomic Operations, Precision, Negative Overdraft Guard)',
      code: `"""
Test Suite for Banking Transaction Services
Runs with pytest against isolated test database.
"""
import pytest
from decimal import Decimal
from app import create_app, db
from app.models import Customer, Account, Transaction
from app.services.banking_service import process_deposit, process_withdrawal

@pytest.fixture
def client():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_initial_demo_account_zero_balance(client):
    # Verify account starts at exactly 0.00
    account = Account(account_number="9999", customer_id=1, balance=Decimal("0.00"))
    db.session.add(account)
    db.session.commit()
    assert account.balance == Decimal("0.00")

def test_deposit_updates_balance_atomically(client):
    account = Account(account_number="1001", customer_id=1, balance=Decimal("0.00"))
    db.session.add(account)
    db.session.commit()

    success, msg, txn = process_deposit("1001", Decimal("1500.50"), "Stipend")
    assert success is True
    assert txn.balance_after == Decimal("1500.50")
    assert account.balance == Decimal("1500.50")

def test_withdrawal_prevents_overdraft(client):
    account = Account(account_number="1002", customer_id=2, balance=Decimal("500.00"))
    db.session.add(account)
    db.session.commit()

    # Attempt to withdraw more than available funds
    success, msg, txn = process_withdrawal("1002", Decimal("600.00"), "Overdraft attempt")
    assert success is False
    assert "Insufficient" in msg
    assert account.balance == Decimal("500.00") # Balance unchanged`,
    },
  };

  const copyCode = () => {
    navigator.clipboard.writeText(files[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AccountPulse Academic Python & MySQL Codebase</span>
                <span className="text-[11px] font-mono bg-blue-900/60 text-cyan-300 px-2 py-0.5 rounded-full border border-blue-600/40">
                  Project 16
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect backend architecture, SQLAlchemy models, and Pandas analytics implementation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Sidebar */}
          <div className="w-full md:w-64 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1 overflow-y-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-3 block mb-1">Source Code Files</span>
            {Object.keys(files).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                  activeFile === fileName
                    ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-slate-800 px-3 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>MySQL Schema</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Database: <code className="text-cyan-400">banking_analysis</code>
                <br />
                Tables: <code className="text-slate-300">customers, accounts, transactions, transaction_flags</code>
              </p>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold">{activeFile}</span>
                <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                  — {files[activeFile].desc}
                </span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 bg-slate-950/40 leading-relaxed selection:bg-blue-600 selection:text-white">
              <code>{files[activeFile].code}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Python 3.13 • Flask-SQLAlchemy • Pandas • MySQL 8.0</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
