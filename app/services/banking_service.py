"""
Banking Service: Atomic Deposits, Withdrawals, Account Provisioning, and Seeding
"""

import uuid
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
from app import db
from app.models import Customer, Account, Transaction
from app.services.flagging_service import evaluate_transaction_rules


def quantize_amount(value) -> Decimal:
    """Ensures strict 2 decimal places monetary quantization using Decimal."""
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def seed_initial_demo_accounts():
    """
    Idempotently seeds the EXACT 5 DEMO BANK ACCOUNTS required:
    1001 -> Demo Customer 1
    1002 -> Demo Customer 2
    1003 -> Demo Customer 3
    1004 -> Demo Customer 4
    1005 -> Demo Customer 5
    Each starting strictly with ₹0.00 balance.
    Also provisions the Banklytics Administrator safely.
    """
    demo_configs = [
        {"id": 1, "name": "Demo Customer 1", "user": "demouser1", "email": "demo1@banklytics.edu", "acct": "1001"},
        {"id": 2, "name": "Demo Customer 2", "user": "demouser2", "email": "demo2@banklytics.edu", "acct": "1002"},
        {"id": 3, "name": "Demo Customer 3", "user": "demouser3", "email": "demo3@banklytics.edu", "acct": "1003"},
        {"id": 4, "name": "Demo Customer 4", "user": "demouser4", "email": "demo4@banklytics.edu", "acct": "1004"},
        {"id": 5, "name": "Demo Customer 5", "user": "demouser5", "email": "demo5@banklytics.edu", "acct": "1005"},
    ]

    for item in demo_configs:
        cust = Customer.query.filter_by(username=item["user"]).first()
        if not cust:
            cust = Customer(
                full_name=item["name"],
                username=item["user"],
                email=item["email"],
                role="CUSTOMER"
            )
            cust.set_password(f"Demo@{item['acct']}")
            db.session.add(cust)
            db.session.flush()

        acct = Account.query.filter_by(account_number=item["acct"]).first()
        if not acct:
            acct = Account(
                account_number=item["acct"],
                customer_id=cust.customer_id,
                account_type="Savings",
                balance=Decimal("0.00")
            )
            db.session.add(acct)

    # Seed Banklytics System Administrator safely
    admin = Customer.query.filter_by(username="admin").first()
    if not admin:
        admin = Customer(
            full_name="Banklytics System Administrator",
            username="admin",
            email="admin@banklytics.internal",
            role="ADMIN"
        )
        admin.set_password("Admin@Banklytics2026")
        db.session.add(admin)

    db.session.commit()


def process_deposit(account_number: str, raw_amount, description: str = "Deposit") -> tuple[bool, str, Transaction | None]:
    """
    Atomically deposits simulated funds into an account using database row-level locking.
    """
    try:
        amount = quantize_amount(raw_amount)
    except Exception:
        return False, "Invalid monetary format. Please provide a valid decimal number.", None

    if amount <= Decimal("0.00"):
        return False, "Deposit amount must be strictly greater than ₹0.00.", None

    try:
        account = Account.query.filter_by(account_number=account_number).with_for_update().first()
        if not account:
            return False, "Account record not found.", None

        new_balance = account.balance + amount
        account.balance = new_balance

        txn_id = f"BNK-{uuid.uuid4().hex[:10].upper()}"
        transaction = Transaction(
            transaction_id=txn_id,
            account_id=account.account_id,
            transaction_date=datetime.now(timezone.utc),
            transaction_type="DEPOSIT",
            amount=amount,
            description=description.strip() if description else "Simulated Deposit",
            balance_after=new_balance
        )
        db.session.add(transaction)
        db.session.commit()

        evaluate_transaction_rules(transaction)

        return True, f"Successfully deposited ₹{amount:,.2f}. Updated balance: ₹{new_balance:,.2f}.", transaction
    except Exception as e:
        db.session.rollback()
        return False, f"Deposit operation failed: {str(e)}", None


def process_withdrawal(account_number: str, raw_amount, description: str = "Withdrawal") -> tuple[bool, str, Transaction | None]:
    """
    Atomically withdraws simulated funds from an account with row-level locking and strict overdraft guards.
    """
    try:
        amount = quantize_amount(raw_amount)
    except Exception:
        return False, "Invalid monetary format. Please provide a valid decimal number.", None

    if amount <= Decimal("0.00"):
        return False, "Withdrawal amount must be strictly greater than ₹0.00.", None

    try:
        account = Account.query.filter_by(account_number=account_number).with_for_update().first()
        if not account:
            return False, "Account record not found.", None

        if amount > account.balance:
            return False, f"Insufficient funds. Requested: ₹{amount:,.2f}, Available: ₹{account.balance:,.2f}.", None

        new_balance = account.balance - amount
        account.balance = new_balance

        txn_id = f"BNK-{uuid.uuid4().hex[:10].upper()}"
        transaction = Transaction(
            transaction_id=txn_id,
            account_id=account.account_id,
            transaction_date=datetime.now(timezone.utc),
            transaction_type="WITHDRAWAL",
            amount=amount,
            description=description.strip() if description else "Simulated Withdrawal",
            balance_after=new_balance
        )
        db.session.add(transaction)
        db.session.commit()

        evaluate_transaction_rules(transaction)

        return True, f"Successfully withdrew ₹{amount:,.2f}. Remaining balance: ₹{new_balance:,.2f}.", transaction
    except Exception as e:
        db.session.rollback()
        return False, f"Withdrawal operation failed: {str(e)}", None


def register_new_customer(full_name: str, username: str, email: str, password: str) -> tuple[bool, str, Customer | None]:
    """
    Registers a new demo customer, hashes credentials, and assigns a unique sequential account number with ₹0.00 balance.
    """
    username_clean = username.strip().lower()
    email_clean = email.strip().lower()

    if Customer.query.filter_by(username=username_clean).first():
        return False, "Username is already taken.", None

    if Customer.query.filter_by(email=email_clean).first():
        return False, "Email address is already registered.", None

    try:
        new_customer = Customer(
            full_name=full_name.strip(),
            username=username_clean,
            email=email_clean,
            role="CUSTOMER"
        )
        new_customer.set_password(password)
        db.session.add(new_customer)
        db.session.flush()

        all_accounts = Account.query.all()
        max_num = 1005
        for a in all_accounts:
            try:
                num = int(a.account_number)
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
        next_acct_num = str(max_num + 1)

        new_account = Account(
            account_number=next_acct_num,
            customer_id=new_customer.customer_id,
            account_type="Savings",
            balance=Decimal("0.00")
        )
        db.session.add(new_account)
        db.session.commit()

        return True, f"Registration successful! Your Banklytics account number is {next_acct_num}.", new_customer
    except Exception as e:
        db.session.rollback()
        return False, f"Registration failed: {str(e)}", None
