"""
Dashboard and Landing Page Routes
"""

from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user
from app.models import Account, Transaction, TransactionFlag
from app.services.analytics_service import calculate_account_analytics

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/")
def landing():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard.index"))
    # Load 5 demo accounts for landing display
    accounts = Account.query.order_by(Account.account_number.asc()).limit(5).all()
    return render_template("index.html", accounts=accounts)


@dashboard_bp.route("/dashboard")
@login_required
def index():
    if current_user.is_admin:
        return redirect(url_for("admin.index"))

    # Retrieve current user's primary account
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        return "No account record linked to customer.", 404

    # Fetch recent transactions
    recent_transactions = (
        Transaction.query.filter_by(account_id=account.account_id)
        .order_by(Transaction.transaction_date.desc())
        .limit(6)
        .all()
    )

    # Compute analytics
    stats = calculate_account_analytics(account.account_number)

    # Fetch any pending flags
    pending_flags = (
        TransactionFlag.query.join(Transaction)
        .filter(
            Transaction.account_id == account.account_id,
            TransactionFlag.review_status == "PENDING_REVIEW"
        )
        .all()
    )

    return render_template(
        "dashboard.html",
        account=account,
        recent_transactions=recent_transactions,
        stats=stats,
        pending_flags_count=len(pending_flags),
    )
