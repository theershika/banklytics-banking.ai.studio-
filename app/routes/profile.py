"""
Profile Management and Unusual Transaction Review Routes
"""

from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_required, current_user
from app import db
from app.models import Customer, Account, Transaction, TransactionFlag

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile", methods=["GET", "POST"])
@login_required
def index():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()

    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        email = request.form.get("email", "").strip().lower()

        if not full_name or not email:
            flash("Full name and email cannot be empty.", "danger")
            return redirect(url_for("profile.index"))

        # Check if email is used by another user
        existing = Customer.query.filter(
            Customer.email == email,
            Customer.customer_id != current_user.customer_id
        ).first()

        if existing:
            flash("Email address is already in use by another account.", "danger")
            return redirect(url_for("profile.index"))

        current_user.full_name = full_name
        current_user.email = email
        db.session.commit()
        flash("Profile updated successfully.", "success")
        return redirect(url_for("profile.index"))

    return render_template("profile.html", account=account)


@profile_bp.route("/flags")
@login_required
def flags():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        flash("Account not found.", "danger")
        return redirect(url_for("dashboard.index"))

    all_flags = (
        TransactionFlag.query.join(Transaction)
        .filter(Transaction.account_id == account.account_id)
        .order_by(TransactionFlag.created_at.desc())
        .all()
    )

    return render_template("flags.html", account=account, flags=all_flags)


@profile_bp.route("/flags/<flag_id>/update", methods=["POST"])
@login_required
def update_flag(flag_id):
    flag = TransactionFlag.query.get_or_404(flag_id)
    # Authorization check: verify flag belongs to current user's account
    if flag.transaction.account.customer_id != current_user.customer_id:
        flash("Unauthorized action.", "danger")
        return redirect(url_for("profile.flags"))

    new_status = request.form.get("status", "REVIEWED").upper()
    if new_status in ("REVIEWED", "DISMISSED"):
        flag.review_status = new_status
        db.session.commit()
        flash(f"Flag status updated to {new_status}.", "success")

    return redirect(url_for("profile.flags"))
