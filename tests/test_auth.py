"""
Unit and integration tests for Authentication and Demo initialization
"""

from decimal import Decimal
from app import db
from app.models import Customer, Account
from app.services.banking_service import seed_initial_demo_accounts


def test_homepage_loads(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Banklytics" in response.data or b"AccountPulse" in response.data


def test_demo_accounts_initialized_correctly(app):
    with app.app_context():
        # Check all 5 demo accounts exist
        for i in range(1, 6):
            acct_num = str(1000 + i)
            acct = Account.query.filter_by(account_number=acct_num).first()
            assert acct is not None
            assert acct.balance == Decimal("0.00")
            assert acct.customer.full_name == f"Demo Customer {i}"


def test_demo_initialization_idempotent(app):
    with app.app_context():
        # Running seed again should not duplicate accounts
        seed_initial_demo_accounts()
        count = Account.query.count()
        assert count == 5


def test_registration_success(client, app):
    response = client.post("/register", data={
        "full_name": "New Student",
        "username": "newstudent",
        "email": "student@college.edu",
        "password": "Password@123",
        "confirm_password": "Password@123"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Dashboard" in response.data

    with app.app_context():
        new_cust = Customer.query.filter_by(username="newstudent").first()
        assert new_cust is not None
        assert new_cust.accounts[0].account_number == "1006"
        assert new_cust.accounts[0].balance == Decimal("0.00")


def test_duplicate_registration_rejected(client):
    client.post("/register", data={
        "full_name": "Student A",
        "username": "unique_student",
        "email": "unique@college.edu",
        "password": "Password@123",
        "confirm_password": "Password@123"
    }, follow_redirects=True)

    # Logout so registration form is accessible again
    client.get("/logout", follow_redirects=True)

    # Attempt duplicate username
    response = client.post("/register", data={
        "full_name": "Student B",
        "username": "unique_student",
        "email": "different@college.edu",
        "password": "Password@123",
        "confirm_password": "Password@123"
    }, follow_redirects=True)

    assert b"Username is already taken" in response.data


def test_login_success(client):
    response = client.post("/login", data={
        "identifier": "demouser1",
        "password": "Demo@1001"
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Welcome back, Demo Customer 1" in response.data


def test_invalid_login_rejected(client):
    response = client.post("/login", data={
        "identifier": "demouser1",
        "password": "WrongPassword"
    }, follow_redirects=True)

    assert b"Invalid credentials" in response.data


def test_protected_routes_reject_unauthenticated(client):
    protected_urls = ["/dashboard", "/deposit", "/withdraw", "/transactions", "/analytics", "/reports", "/profile"]
    for url in protected_urls:
        response = client.get(url, follow_redirects=False)
        assert response.status_code == 302
        assert "/login" in response.location


def test_logout_works(auth_client):
    response = auth_client.get("/logout", follow_redirects=True)
    assert response.status_code == 200
    assert b"signed out" in response.data
