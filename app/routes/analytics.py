"""
Financial Analytics Routes: Chart.js visualizations, Pandas analytics, Smart Insights, and Matplotlib chart image exports
"""

from flask import Blueprint, render_template, send_file, flash, redirect, url_for
from flask_login import login_required, current_user
from app.models import Account
from app.services.analytics_service import (
    calculate_account_analytics,
    generate_smart_insights,
    generate_matplotlib_chart_image,
)

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/analytics")
@login_required
def index():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        flash("Account not found.", "danger")
        return redirect(url_for("dashboard.index"))

    stats = calculate_account_analytics(account.account_number)
    return render_template("analytics.html", account=account, stats=stats)


@analytics_bp.route("/insights")
@login_required
def insights():
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        flash("Account not found.", "danger")
        return redirect(url_for("dashboard.index"))

    stats = calculate_account_analytics(account.account_number)
    smart_insights = generate_smart_insights(account.account_number)
    return render_template("insights.html", account=account, stats=stats, insights=smart_insights)


@analytics_bp.route("/analytics/chart.png")
@login_required
def download_chart():
    """Returns dynamic Matplotlib generated analytical chart image for download/viewing."""
    account = Account.query.filter_by(customer_id=current_user.customer_id).first()
    if not account:
        return "Account not found", 404

    buf = generate_matplotlib_chart_image(account.account_number)
    return send_file(
        buf,
        mimetype="image/png",
        as_attachment=True,
        download_name=f"Banklytics_Chart_{account.account_number}.png"
    )
