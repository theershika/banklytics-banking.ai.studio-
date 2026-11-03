# BANKLYTICS: Complete Project Explanation Guide

> **"Smart Banking. Smarter Insights."**  
> **Academic Project Reference:** Project 16 — Banking Transaction Analysis System  
> **Prepared for:** Academic Evaluation, Course Viva, and Project Presentation  

---

## 1. Project Aim & Objectives

The primary objective of **BANKLYTICS** is to build a realistic, educational simulation of a modern retail banking ledger combined with a data science analytics pipeline and role-based platform administration.

### Specific Goals:
1. Provide a simulated customer banking environment where students can register, log in, deposit, and withdraw synthetic money.
2. Demonstrate how financial institutions prevent data corruption using database transactions and strict precision.
3. Apply scientific data processing tools (**Pandas** and **NumPy**) to extract actionable financial metrics, spending velocity, and behavioral recommendations from transaction histories.
4. Visualize cash flows through interactive dashboards, 5 distinct charts, and downloadable analytical reports.
5. Provide client and server-side PDF generation for single transaction receipts and official monthly statements with audit watermarks.
6. Introduce audit safety concepts through rule-based anomaly detection without false claims of black-box AI.
7. Demonstrate Role-Based Access Control (RBAC) through a dedicated Administrator console.

---

## 2. Problem Statement

Many standard academic web applications handle financial calculations using basic floating-point data types (e.g. `float` in Python or `FLOAT/DOUBLE` in SQL). This introduces binary rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`), which can cause cumulative ledger discrepancies.

Furthermore, traditional student projects often lack:
- Concurrency control (two rapid withdrawals causing a negative balance or race condition).
- Data science integration (relying only on SQL `SUM()` queries instead of Pandas DataFrame time-series aggregation).
- Separation of concerns between routing, business services, and database persistence.
- Role isolation between retail customer actions and platform compliance oversight.

**BANKLYTICS solves these problems** by implementing enterprise architectural patterns:
- Fixed-point `Decimal` arithmetic.
- Row-level database locking and atomic transactions.
- Blueprint-driven modular Flask architecture alongside a reactive frontend.
- Analytical pipelines powered by Pandas and NumPy.
- Role-Based Access Control (`CUSTOMER` vs `ADMIN`).

---

## 3. Why Each Technology Was Chosen

### A. Why Flask & React Dual-Architecture?
1. **Flask (Python Backend):** Lightweight, transparent, and modular. It provides an explicit learning pipeline for students to study SQLAlchemy transactions, CSRF security, and Pandas data analytics.
2. **React 19 + Tailwind v4 (Frontend):** Delivers an instantaneous, responsive modern fintech UI with 3D virtual card tilt, live confirmation modals, and zero-latency client-side PDF generation via jsPDF.

### B. Why MySQL & SQLAlchemy?
1. **Relational Integrity:** Banking requires strict relationships between Customers, Accounts, Transactions, and Flags. Foreign keys ensure orphan records cannot exist.
2. **ACID Compliance:** Atomicity, Consistency, Isolation, and Durability ensure that if a transaction fails halfway through, all changes are rolled back cleanly.
3. **DECIMAL(15,2):** MySQL stores financial amounts as exact numeric strings, guaranteeing absolute precision to 2 decimal places.

### C. How Pandas Works in Banklytics
Instead of running heavy SQL joins across dozens of subqueries, Banklytics loads transaction records into a Pandas DataFrame:
```python
df = pd.DataFrame(records)
df['transaction_date'] = pd.to_datetime(df['transaction_date'])
df['amount'] = df['amount'].astype(float)

# Monthly grouping
monthly_summary = df.groupby([
    df['transaction_date'].dt.to_period('M'),
    'transaction_type'
])['amount'].sum().unstack(fill_value=0)
```
This enables vectorized time-series aggregation, standard deviation, interquartile ranges, and spending velocity computations in sub-millisecond execution times.

### D. How NumPy is Used
NumPy computes dispersion metrics (mean, median, standard deviation, and IQR spread) and aligns array coordinates for multi-bar comparative charts.

---

## 4. Rule-Based Anomaly Engine Explained

Banklytics avoids black-box AI claims. Instead, it demonstrates deterministic heuristics modeled on real fraud-monitoring rule engines:

1. **Rule 1: High-Value Threshold**
   - Condition: Any single transaction where `amount > ₹25,000.00`.
   - Purpose: Flags high-value transfers requiring compliance review.
2. **Rule 2: Rapid Velocity Spike**
   - Condition: 3 or more withdrawals initiated within a rolling 60-minute window.
   - Purpose: Detects sudden automated drainage or credential compromise.
3. **Rule 3: Historical Deviation Spike**
   - Condition: A debit exceeding 3× the customer's historical mean withdrawal amount.
   - Purpose: Flags unusual outlier behavior compared to baseline spending patterns.

---

## 5. Security Architecture

1. **Password Hashing:** Uses Werkzeug's `generate_password_hash` with `scrypt` key derivation function (cost parameters $N=32768, r=8, p=1$). Passwords are never stored in plaintext.
2. **Role-Based Access Control (RBAC):** Every endpoint under `/admin/` is protected by `@admin_required` decorators verifying `current_user.is_admin`.
3. **Data Isolation:** Queries strictly enforce `account.customer_id == current_user.customer_id` so customers can never view or modify other accounts.
4. **Strict Overdraft Guard:**
   ```python
   if account.balance < amount:
       return False, "Insufficient funds for withdrawal."
   account.balance -= amount
   ```
5. **Anti-CSRF Protection:** Form submissions require synchronized cryptographic tokens verified via Flask-WTF.

---

## 6. Viva & Presentation Questions Guide

### Q1: Why did you use Decimal instead of Float?
**Answer:** Floating-point numbers use base-2 binary representation, which cannot represent numbers like `0.1` or `0.01` exactly. Over thousands of transactions, accumulated rounding errors cause ledger imbalances. The `Decimal` type uses base-10 fixed-point arithmetic, exactly matching monetary currency standards.

### Q2: How does the application prevent negative balances?
**Answer:** The withdrawal service performs a balance check inside an atomic database transaction. If the requested amount exceeds the current balance, the operation is rejected before database commits, preventing overdrafts.

### Q3: How does Pandas improve on standard SQL aggregation?
**Answer:** While SQL can calculate simple `SUM` and `COUNT`, Pandas allows vector time-series manipulation, quantile calculation (IQR), calendar period transformations, and automated trend classification within Python memory in a single clean pass.

### Q4: How is Role-Based Access Control implemented?
**Answer:** The `Customer` model has a `role` field (`CUSTOMER` vs `ADMIN`). An `@admin_required` decorator checks the authenticated user's role before executing admin-only routes, redirecting unauthorized users with an error flash.
