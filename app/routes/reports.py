"""
Monthly Financial Statement and Report Routes
"""

from datetime import datetime, timezone
from flask import Blueprint, render_template, request, Response, flash, redirect, url_for
from flask_login import login_required, current_user
from app.models import Account
from app.services.reporting_service import get_monthly_statement, generate_transactions_csv

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/reports")
@login_required
def index():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        flash("Account not found.", "danger")
        return redirect(url_for("dashboard.index"))

    now = datetime.now(timezone.utc)
    year = request.args.get("year", now.year, type=int)
    month = request.args.get("month", now.month, type=int)

    statement = get_monthly_statement(account.account_number, year, month)

    available_years = [now.year, now.year - 1, now.year - 2]
    months_list = [
        (1, "January"), (2, "February"), (3, "March"), (4, "April"),
        (5, "May"), (6, "June"), (7, "July"), (8, "August"),
        (9, "September"), (10, "October"), (11, "November"), (12, "December")
    ]

    return render_template(
        "reports.html",
        account=account,
        statement=statement,
        selected_year=year,
        selected_month=month,
        available_years=available_years,
        months_list=months_list
    )


@reports_bp.route("/reports/export")
@login_required
def export_monthly_csv():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        return "Account not found", 404

    now = datetime.now(timezone.utc)
    year = request.args.get("year", now.year, type=int)
    month = request.args.get("month", now.month, type=int)

    statement = get_monthly_statement(account.account_number, year, month)
    csv_stream = generate_transactions_csv(statement.get("transactions", []), account.account_number)

    filename = f"AccountPulse_Statement_{account.account_number}_{year}_{month:02d}.csv"
    return Response(
        csv_stream.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
