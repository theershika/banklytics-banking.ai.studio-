# BANKLYTICS — Digital Banking & Transaction Analysis System

> **"Smart Banking. Smarter Insights."**  
> **Academic Project Reference:** Project 16 — Banking Transaction Analysis System  
> **Difficulty Level:** Intermediate to Advanced  
> **Platform Category:** Educational Banking Simulation & Financial Ledger Analytics  

---

## 1. Project Overview & Academic Objective

**BANKLYTICS** is a modern fintech digital banking simulation and analytical intelligence platform. It demonstrates the mechanics of double-entry ledger tracking, decimal-precision financial calculations, rule-based transaction anomaly detection, automated behavioral insights, and enterprise statistical data science.

The platform provides dual operational interfaces:
1. **Interactive Live Web Application (Port 3000)**: Instant, zero-config high-fidelity React 19 + Tailwind CSS v4 banking application with interactive 3D virtual debit card, real-time balance calculations, confirmation modals, 5 financial analytics charts, PDF statement and receipt generators, and Admin Management portal.
2. **Production-Ready Python Full-Stack Codebase**: Complete Flask + SQLAlchemy ORM + MySQL 8.0 + Pandas + NumPy + Matplotlib architecture ready to execute in user environments with comprehensive unit and integration test suites.

> **Simulation Disclaimer:**  
> Banklytics is strictly an educational simulation using synthetic financial data. It does not connect to real banking networks, process actual monetary payments, or expose financial credentials.

---

## 2. Key Platform Features

### A. Digital Banking & Account Overview
- **Virtual Digital Account Card**: Interactive 3D tilt card displaying Banklytics branding, masked demo account number (`•••• •••• •••• 1001`), EMV chip, contactless indicator, and explicit "SIMULATION" label.
- **5 Comprehensive Financial Cards**: Real-time display of Available Balance, Total Deposits, Total Withdrawals, Monthly Net Cash Flow, and Total Transactions.
- **Light & Dark Theme Modes**: Seamless one-click switching with persistent theme memory.

### B. High-Precision Transaction Engine
- **Atomic Operations**: All financial updates execute with ACID compliance and strict `Decimal` precision.
- **Overdraft Guard**: Hard prevention of withdrawals exceeding available simulated balance.
- **Transaction Confirmation Modal**: Live balance projection preview and confirmation review step before ledger commit.
- **Instant PDF Receipts**: Downloadable single-transaction confirmation receipts generated on client/server.

### C. Ledger Management & Multi-Criteria Filtering
- **Advanced Search & Filtering**: Filter by transaction type (DEPOSIT / WITHDRAWAL), date range, minimum and maximum amount, and description text.
- **Multi-Format Export**: RFC-4180 CSV export and branded PDF export.

### D. Financial Analytics & Smart Insights
- **5 Interactive Visualizations**:
  - Monthly Cash Flow (Deposits vs. Withdrawals bar chart)
  - Balance Trend Line Chart (historical cumulative balance trajectory)
  - Transaction Type Distribution (doughnut breakdown)
  - Inflow vs. Outflow Cash Flow Sankey/Bar comparison
  - Expenditure Category Distribution
- **Pandas & NumPy Smart Insights**: Automated calculation of daily spending velocity, deposit inflow velocity, savings retention percentage, cash flow health indicator, and algorithmic behavioral recommendations.
- **Matplotlib High-Resolution Export**: Server-side programmatic analytical figure export (`/analytics/chart.png`).

### E. Official Monthly Bank Statements
- **Statement Reconciliation**: Opening balance, closing balance, gross credits, gross debits, net movement, and itemized ledger.
- **Audit Watermark**: Prominent watermark reading `EDUCATIONAL SIMULATION — NOT A REAL BANK STATEMENT`.
- **Downloadable PDF Statement**: Formal statement layout with Banklytics headers and summary blocks.

### F. Compliance & Rule-Based Anomaly Flags
- **High-Value Threshold**: Automatically flags individual transactions exceeding ₹25,000.00.
- **Velocity Spike Detection**: Flags accounts initiating 3 or more rapid withdrawals within a 1-hour window.
- **Spike Anomaly Flag**: Flags transactions exceeding 3× the account's historical average.

### G. Banklytics Administrator Portal (RBAC)
- **Role-Based Access Control**: Dedicated `/admin/` portal accessible only by users with `ADMIN` privileges.
- **System-Wide Liquidity Monitoring**: Aggregate liquidity, total system deposits, and total system withdrawals.
- **Customer Directory**: Complete breakdown of retail customer accounts, active balances, and transaction volume.
- **Anomaly Audit Queue**: Centralized review interface to acknowledge or dismiss flagged transactions.

---

## 3. Technology Stack

### Backend
- **Python 3.13 / 3.10+**
- **Flask 3.0.3**: Modular application factory and blueprint architecture.
- **Flask-SQLAlchemy 3.1.1**: ORM with relational schema models.
- **Flask-Login 0.6.3**: Session management and route protection.
- **Flask-WTF 1.2.1**: CSRF protection on forms.
- **Werkzeug 3.0.3**: Cryptographic password hashing (`scrypt` / `pbkdf2`).
- **PyMySQL 1.1.1**: Pure Python MySQL 8.0 client driver.
- **python-dotenv 1.0.1**: Environment configuration management.

### Data Science & Analytics
- **Pandas 2.2.2**: High-performance DataFrame grouping and descriptive statistical metrics.
- **NumPy 1.26.4**: Numerical array computations and statistical dispersion.
- **Matplotlib 3.8.4**: Server-side analytical figure rendering.

### Frontend
- **React 19 & TypeScript**: Responsive single-page application on Vite.
- **Tailwind CSS v4**: Modern fintech styling with navy blue, cyan, and dark mode palette.
- **Bootstrap 5.3.3 & Bootstrap Icons**: Responsive layout for Flask Jinja2 templates.
- **jsPDF 2.5.2**: Client-side PDF receipt and statement rendering.
- **Chart.js 4.4.2**: Dynamic canvas visualizations.

### Testing & Quality Assurance
- **pytest 8.2.0**: Automated unit and integration testing suite.
- **pytest-flask**: Flask test client fixtures and authenticated session simulations.

---

## 4. Directory Structure

```
Banklytics/
├── app/
│   ├── __init__.py                 # Application factory & blueprint registration
│   ├── config.py                   # Dev, Test, Prod configuration classes
│   ├── models.py                   # Customer, Account, Transaction, TransactionFlag
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── admin.py                # Admin portal with @admin_required RBAC
│   │   ├── auth.py                 # Login, register, logout, demo switchers
│   │   ├── dashboard.py            # Landing page and main dashboard
│   │   ├── banking.py              # Atomic deposits and withdrawals
│   │   ├── transactions.py         # Search, filter, pagination, and CSV export
│   │   ├── analytics.py            # Analytics dashboard, Smart Insights & Matplotlib export
│   │   ├── reports.py              # Monthly statements and statement CSV
│   │   └── profile.py              # Profile management & anomaly review flags
│   ├── services/
│   │   ├── __init__.py
│   │   ├── banking_service.py      # Core ledger transactions & demo seeding
│   │   ├── analytics_service.py    # Pandas/NumPy analytics engine & smart insights
│   │   ├── reporting_service.py    # Monthly balance reconciliation
│   │   └── flagging_service.py     # Deterministic heuristic anomaly rules
│   └── templates/
│       ├── base.html               # Shared layout, navbar, theme toggle & footer
│       ├── index.html              # Landing page
│       ├── login.html              # Sign-in form with 1-click demo buttons
│       ├── register.html           # Registration form
│       ├── dashboard.html          # Main account overview & KPI statistics
│       ├── admin.html              # Admin platform & compliance console
│       ├── insights.html           # Smart Financial Insights view
│       ├── deposit.html            # Simulated deposit interface
│       ├── withdraw.html           # Simulated withdrawal interface
│       ├── transactions.html       # Transaction ledger table
│       ├── analytics.html          # Interactive charts & statistical metrics
│       ├── reports.html            # Monthly financial statements with watermark
│       ├── flags.html              # Unusual transaction review interface
│       ├── profile.html            # Profile management
│       └── errors/
│           ├── 404.html
│           └── 500.html
├── src/                            # React 19 + Tailwind v4 Interactive UI
│   ├── App.tsx                     # Main application container & view router
│   ├── components/                 # UI Views: Dashboard, DigitalCard, AdminView, Insights, etc.
│   ├── services/storage.ts         # High-precision storage engine & demo seeding
│   ├── utils/pdfExport.ts          # jsPDF transaction receipt and statement generators
│   └── types/banking.ts            # Type definitions for accounts, ledgers, and metrics
├── scripts/
│   ├── init_db.sql                 # MySQL 8.0 schema creation script
│   └── seed_demo.py                # Standalone CLI seeder for demo accounts
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures and in-memory SQLite isolation
│   ├── test_auth.py                # Authentication and session tests
│   ├── test_banking.py             # Atomic ledger operations and overdraft protection
│   ├── test_analytics.py           # Pandas analytics and monthly statements
│   ├── test_security.py            # Password hashing and anomaly rules
│   └── test_admin.py               # Admin portal RBAC and smart insights
├── run.py                          # Application entry point (Port 5000)
├── requirements.txt                # Python backend dependencies
└── README.md                       # Comprehensive documentation
```

---

## 5. Demo Accounts & Credentials

The platform seeds 5 demo retail accounts with initial balances of ₹0.00, plus 1 privileged Administrator account:

| Account No. | Username | Full Name | Account Type | Role | Default Password |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **N/A** | `admin` | System Administrator | Platform Admin | `ADMIN` | `Admin@Banklytics2026` |
| **1001** | `demouser1` | Rajesh Sharma | SAVINGS | `CUSTOMER` | `Demo@1001` |
| **1002** | `demouser2` | Priya Patel | CURRENT | `CUSTOMER` | `Demo@1002` |
| **1003** | `demouser3` | Amit Kumar | SAVINGS | `CUSTOMER` | `Demo@1003` |
| **1004** | `demouser4` | Sneha Reddy | CURRENT | `CUSTOMER` | `Demo@1004` |
| **1005** | `demouser5` | Vikram Singh | SAVINGS | `CUSTOMER` | `Demo@1005` |

---

## 6. How to Run Locally

### Option A: Interactive Web Application (Live Sandbox)
The development server is actively running on **Port 3000**:
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the full Banklytics fintech suite.

### Option B: Local Python Flask Backend
1. **Clone or navigate to the repository directory**:
   ```bash
   cd Banklytics
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. **Initialize Database and Seed Demo Accounts**:
   ```bash
   python scripts/seed_demo.py
   ```

6. **Start the Flask Application**:
   ```bash
   python run.py
   ```
   Open `http://127.0.0.1:5000` in your web browser.

---

## 7. Running the Automated Test Suite

Run all automated pytest suites:
```bash
pytest -v
```

This executes all tests verifying:
- Authentication, session security, and password cryptographic hashing
- Atomic deposits, withdrawals, and strict overdraft guard
- Pandas/NumPy descriptive statistics, dispersion metrics, and monthly reconciliation
- Heuristic anomaly detection (high-value threshold, rapid velocity)
- Role-Based Access Control (RBAC) isolating customer and administrator routes
