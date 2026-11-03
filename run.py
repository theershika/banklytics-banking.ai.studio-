"""
AccountPulse: Banking Transaction Analysis System
Academic Project 16 — Banking Transaction Analysis System

Entry point for local execution:
    python run.py
Default address:
    http://127.0.0.1:5000
"""

import os
from dotenv import load_dotenv

# Load environment configuration from .env file
load_dotenv()

from app import create_app, db
from app.services.banking_service import seed_initial_demo_accounts

app = create_app(os.environ.get("FLASK_CONFIG", "default"))


@app.cli.command("init-db")
def init_db_command():
    """CLI Command: Safely creates tables and seeds the 5 demo accounts without duplicating."""
    with app.app_context():
        db.create_all()
        seed_initial_demo_accounts()
        print("Successfully initialized database tables and validated 5 demo accounts.")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")

    # Initialize tables and seed demo accounts safely on startup
    with app.app_context():
        try:
            db.create_all()
            seed_initial_demo_accounts()
        except Exception as e:
            print(f"[Warning] Automatic DB sync deferred: {e}")
            print("Please ensure MySQL server is running or run 'flask init-db'.")

    print("\n" + "=" * 64)
    print("  BANKLYTICS: Digital Banking & Transaction Analysis System")
    print("  Smart Banking. Smarter Insights.")
    print(f"  Local Web Server Running at: http://127.0.0.1:{port}")
    print("  Initial Demo Accounts: 1001 to 1005 (Starting Balance: ₹0.00)")
    print("  Administrator Access: admin / Admin@Banklytics2026")
    print("  Educational simulation only - synthetic transaction data.")
    print("=" * 64 + "\n")

    app.run(host="0.0.0.0", port=port, debug=debug)
