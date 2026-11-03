"""
Independent CLI Seeder for AccountPulse Demo Accounts
Ensures the 5 initial demo accounts exist with exactly ₹0.00 initial balance.
"""

from app import create_app, db
from app.services.banking_service import seed_initial_demo_accounts

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
        seed_initial_demo_accounts()
        print("Demo seeding complete: Accounts 1001 to 1005 (₹0.00 balance) and Administrator account verified.")
