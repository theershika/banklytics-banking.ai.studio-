"""
Pytest configuration and test fixtures for AccountPulse
Uses an isolated in-memory test database for test runs.
"""

import pytest
from decimal import Decimal
from app import create_app, db
from app.models import Customer, Account
from app.services.banking_service import seed_initial_demo_accounts


@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        seed_initial_demo_accounts()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()


@pytest.fixture
def auth_client(client, app):
    """Client authenticated as Demo Customer 1 (Account #1001)"""
    with app.app_context():
        client.post("/login", data={
            "identifier": "demouser1",
            "password": "Demo@1001"
        }, follow_redirects=True)
    return client
