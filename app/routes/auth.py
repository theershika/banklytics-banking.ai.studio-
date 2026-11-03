"""
Authentication Routes: Login, Registration, Logout, and Demo Quick-Access
"""

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app.models import Customer
from app.services.banking_service import register_new_customer

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        identifier = request.form.get("identifier", "").strip().lower()
        password = request.form.get("password", "")

        customer = (
            Customer.query.filter(
                (Customer.username == identifier) | (Customer.email == identifier)
            ).first()
        )

        if customer and customer.check_password(password):
            login_user(customer, remember=True)
            flash(f"Welcome back, {customer.full_name}!", "success")
            if customer.is_admin:
                return redirect(url_for("admin.index"))
            next_page = request.args.get("next")
            return redirect(next_page or url_for("dashboard.index"))
        else:
            flash("Invalid credentials. For demo accounts 1001-1005, use password Demo@1001 to Demo@1005.", "danger")

    return render_template("login.html")


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if not full_name or not username or not email or not password:
            flash("All fields are required.", "danger")
            return render_template("register.html")

        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template("register.html")

        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "danger")
            return render_template("register.html")

        success, msg, customer = register_new_customer(full_name, username, email, password)
        if success and customer:
            login_user(customer)
            flash(msg, "success")
            return redirect(url_for("dashboard.index"))
        else:
            flash(msg, "danger")

    return render_template("register.html")


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been signed out safely.", "info")
    return redirect(url_for("dashboard.landing"))


@auth_bp.route("/demo-login/<int:account_number>")
def quick_demo_login(account_number):
    """Convenience endpoint for college viva / demonstration to switch demo accounts."""
    customer_id = account_number - 1000
    customer = Customer.query.get(customer_id)
    if customer:
        login_user(customer)
        flash(f"Switched to {customer.full_name} (Acct #{account_number}).", "success")
    return redirect(url_for("dashboard.index"))
