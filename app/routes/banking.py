"""
Banking Routes: Simulated Deposits and Withdrawals with Atomic Safety
"""

from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_required, current_user
from app.models import Account
from app.services.banking_service import process_deposit, process_withdrawal

banking_bp = Blueprint("banking", __name__)


@banking_bp.route("/deposit", methods=["GET", "POST"])
@login_required
def deposit():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        flash("Account not found.", "danger")
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        amount_raw = request.form.get("amount", "").strip()
        description = request.form.get("description", "").strip()

        success, msg, txn = process_deposit(account.account_number, amount_raw, description)
        if success:
            flash(msg, "success")
            return redirect(url_for("dashboard.index"))
        else:
            flash(msg, "danger")

    return render_template("deposit.html", account=account)


@banking_bp.route("/withdraw", methods=["GET", "POST"])
@login_required
def withdraw():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        flash("Account not found.", "danger")
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        amount_raw = request.form.get("amount", "").strip()
        description = request.form.get("description", "").strip()

        success, msg, txn = process_withdrawal(account.account_number, amount_raw, description)
        if success:
            flash(msg, "success")
            return redirect(url_for("dashboard.index"))
        else:
            flash(msg, "danger")

    return render_template("withdraw.html", account=account)
