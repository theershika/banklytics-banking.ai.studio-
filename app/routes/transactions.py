"""
Transaction Ledger Routes: Search, Filters, Sorting, Pagination, and CSV Export
"""

from datetime import datetime
from flask import Blueprint, render_template, request, Response, redirect, url_for, flash
from flask_login import login_required, current_user
from app.models import Account, Transaction
from app.services.reporting_service import generate_transactions_csv

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("/transactions")
@login_required
def history():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        flash("Account not found.", "danger")
        return redirect(url_for("dashboard.index"))

    # Query params
    search_query = request.args.get("q", "").strip()
    txn_type = request.args.get("type", "").strip().upper()
    start_date = request.args.get("start_date", "").strip()
    end_date = request.args.get("end_date", "").strip()
    sort_by = request.args.get("sort", "newest").strip().lower()
    page = request.args.get("page", 1, type=int)
    per_page = 10

    query = Transaction.query.filter_by(account_id=account.account_id)

    # Search filter
    if search_query:
        query = query.filter(
            (Transaction.description.ilike(f"%{search_query}%")) |
            (Transaction.transaction_id.ilike(f"%{search_query}%"))
        )

    # Transaction type filter
    if txn_type in ("DEPOSIT", "WITHDRAWAL"):
        query = query.filter_by(transaction_type=txn_type)

    # Date filters
    if start_date:
        try:
            s_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Transaction.transaction_date >= s_dt)
        except ValueError:
            pass

    if end_date:
        try:
            e_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            query = query.filter(Transaction.transaction_date <= e_dt)
        except ValueError:
            pass

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(Transaction.transaction_date.asc())
    elif sort_by == "highest":
        query = query.order_by(Transaction.amount.desc())
    elif sort_by == "lowest":
        query = query.order_by(Transaction.amount.asc())
    else:
        query = query.order_by(Transaction.transaction_date.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return render_template(
        "transactions.html",
        account=account,
        transactions=pagination.items,
        pagination=pagination,
        search_query=search_query,
        txn_type=txn_type,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
    )


@transactions_bp.route("/transactions/export")
@login_required
def export_csv():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        return "Account not found", 404

    all_txns = (
        Transaction.query.filter_by(account_id=account.account_id)
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    csv_stream = generate_transactions_csv(all_txns, account.account_number)
    filename = f"AccountPulse_Ledger_{account.account_number}_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    return Response(
        csv_stream.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
