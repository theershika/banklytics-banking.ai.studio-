"""
Banklytics Administrator Portal Routes (Role-Based Access Control)
"""

from functools import wraps
from flask import Blueprint, render_template, redirect, url_for, flash, abort, request
from flask_login import login_required, current_user
from app import db
from app.models import Customer, Account, Transaction, TransactionFlag

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash("Access denied: Administrator privileges required.", "danger")
            return redirect(url_for("dashboard.index"))
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route("/")
@login_required
@admin_required
def index():
    # Fetch all retail customers (excluding admin)
    retail_customers = Customer.query.filter(Customer.role != "ADMIN").all()
    accounts = Account.query.all()
    transactions = Transaction.query.order_by(Transaction.transaction_date.desc()).all()
    flags = (
        TransactionFlag.query.join(Transaction)
        .order_by(TransactionFlag.created_at.desc())
        .all()
    )

    total_deposits = sum([t.amount for t in transactions if t.transaction_type == "DEPOSIT"])
    total_withdrawals = sum([t.amount for t in transactions if t.transaction_type == "WITHDRAWAL"])
    system_liquidity = sum([a.balance for a in accounts])

    # Customer breakdown
    customer_breakdown = []
    for c in retail_customers:
        acct = c.accounts[0] if c.accounts else None
        tx_count = len(acct.transactions) if acct else 0
        customer_breakdown.append({
            "customer": c,
            "account": acct,
            "transaction_count": tx_count
        })

    return render_template(
        "admin.html",
        total_customers=len(retail_customers),
        total_accounts=len(accounts),
        total_deposits=total_deposits,
        total_withdrawals=total_withdrawals,
        system_liquidity=system_liquidity,
        customer_breakdown=customer_breakdown,
        recent_transactions=transactions[:15],
        flags=flags,
        unresolved_flags_count=len([f for f in flags if f.review_status == "PENDING_REVIEW"]),
    )


@admin_bp.route("/flags/<flag_id>/update", methods=["POST"])
@login_required
@admin_required
def update_flag(flag_id):
    flag = TransactionFlag.query.get_or_404(flag_id)
    new_status = request.form.get("status", "REVIEWED").upper()
    if new_status in ("REVIEWED", "DISMISSED"):
        flag.review_status = new_status
        db.session.commit()
        flash(f"Flag {flag.flag_id} updated to {new_status}.", "success")
    return redirect(url_for("admin.index"))
