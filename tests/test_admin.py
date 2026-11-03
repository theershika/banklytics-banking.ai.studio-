"""
Tests for Admin RBAC (Role-Based Access Control) and Smart Insights
"""

from decimal import Decimal
from app.models import Customer, Account
from app.services.banking_service import process_deposit, process_withdrawal
from app.services.analytics_service import generate_smart_insights


def test_admin_account_exists_and_has_role(app):
    with app.app_context():
        admin = Customer.query.filter_by(username="admin").first()
        assert admin is not None
        assert admin.is_admin is True
        assert admin.role == "ADMIN"
        assert admin.check_password("Admin@Banklytics2026") is True


def test_retail_user_cannot_access_admin_portal(client, app):
    # Log in as retail customer demouser1
    login_resp = client.post("/login", data={"identifier": "demouser1", "password": "Demo@1001"}, follow_redirects=True)
    assert login_resp.status_code == 200

    # Attempt to access /admin/
    admin_resp = client.get("/admin/", follow_redirects=True)
    # Should be redirected to dashboard with an access denied flash
    assert b"Access denied: Administrator privileges required" in admin_resp.data


def test_admin_user_can_access_admin_portal(client, app):
    # Log in as admin
    login_resp = client.post("/login", data={"identifier": "admin", "password": "Admin@Banklytics2026"}, follow_redirects=True)
    assert login_resp.status_code == 200

    # Access /admin/
    admin_resp = client.get("/admin/", follow_redirects=True)
    assert admin_resp.status_code == 200
    assert b"Platform Overview & Compliance" in admin_resp.data
    assert b"Retail Customer Directory" in admin_resp.data


def test_smart_insights_generation(app):
    with app.app_context():
        process_deposit("1003", "12000.00", "Monthly Stipend")
        process_deposit("1003", "8000.00", "Consulting Payment")
        process_withdrawal("1003", "3000.00", "Groceries Supermarket")
        process_withdrawal("1003", "1500.00", "Cloud Hosting Invoice")

        insights = generate_smart_insights("1003")
        assert "spending_velocity" in insights
        assert "deposit_velocity" in insights
        assert "savings_rate" in insights
        assert "cash_flow_health" in insights
        assert insights["cash_flow_health"] == "SURPLUS"
        assert insights["savings_rate"] > 0
        assert len(insights["recommendations"]) >= 1
