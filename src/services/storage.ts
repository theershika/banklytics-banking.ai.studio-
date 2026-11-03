import {
  Customer,
  Account,
  Transaction,
  TransactionFlag,
  AnalyticsStats,
  MonthlySummary,
  SmartInsights,
  AdminDashboardData
} from '../types/banking';

const STORAGE_KEYS = {
  INITIALIZED: 'banklytics_initialized_v2',
  CUSTOMERS: 'accountpulse_customers', // Preserve existing customer data!
  ACCOUNTS: 'accountpulse_accounts',     // Preserve existing account data!
  TRANSACTIONS: 'accountpulse_transactions', // Preserve existing transactions!
  FLAGS: 'accountpulse_flags',           // Preserve existing flags!
  SESSION_USER: 'accountpulse_session_user_id',
  THEME: 'banklytics_theme_preference',
};

// Initial exact 5 Demo Accounts as per requirements:
// 1001 -> Demo Customer 1
// 1002 -> Demo Customer 2
// 1003 -> Demo Customer 3
// 1004 -> Demo Customer 4
// 1005 -> Demo Customer 5
const INITIAL_DEMO_CUSTOMERS: Customer[] = [
  {
    customer_id: 1,
    full_name: 'Demo Customer 1',
    username: 'demouser1',
    email: 'demo1@banklytics.edu',
    password_hash: 'Demo@1001',
    role: 'CUSTOMER',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    customer_id: 2,
    full_name: 'Demo Customer 2',
    username: 'demouser2',
    email: 'demo2@banklytics.edu',
    password_hash: 'Demo@1002',
    role: 'CUSTOMER',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    customer_id: 3,
    full_name: 'Demo Customer 3',
    username: 'demouser3',
    email: 'demo3@banklytics.edu',
    password_hash: 'Demo@1003',
    role: 'CUSTOMER',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    customer_id: 4,
    full_name: 'Demo Customer 4',
    username: 'demouser4',
    email: 'demo4@banklytics.edu',
    password_hash: 'Demo@1004',
    role: 'CUSTOMER',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    customer_id: 5,
    full_name: 'Demo Customer 5',
    username: 'demouser5',
    email: 'demo5@banklytics.edu',
    password_hash: 'Demo@1005',
    role: 'CUSTOMER',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    customer_id: 99,
    full_name: 'Banklytics System Administrator',
    username: 'admin',
    email: 'admin@banklytics.internal',
    password_hash: 'Admin@Banklytics2026',
    role: 'ADMIN',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

const INITIAL_DEMO_ACCOUNTS: Account[] = [
  {
    account_id: 1,
    account_number: '1001',
    customer_id: 1,
    account_type: 'Savings',
    balance: 0.0,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    account_id: 2,
    account_number: '1002',
    customer_id: 2,
    account_type: 'Savings',
    balance: 0.0,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    account_id: 3,
    account_number: '1003',
    customer_id: 3,
    account_type: 'Savings',
    balance: 0.0,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    account_id: 4,
    account_number: '1004',
    customer_id: 4,
    account_type: 'Savings',
    balance: 0.0,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    account_id: 5,
    account_number: '1005',
    customer_id: 5,
    account_type: 'Savings',
    balance: 0.0,
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

class BankingDatabase {
  constructor() {
    this.init();
  }

  // Idempotent initialization that preserves existing data
  public init() {
    if (typeof window === 'undefined') return;

    // Check existing customer list; ensure Admin exists without wiping customers
    const existingCustStr = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!existingCustStr) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_DEMO_CUSTOMERS));
    } else {
      try {
        const custs: Customer[] = JSON.parse(existingCustStr);
        if (!custs.some((c) => c.role === 'ADMIN' || c.username === 'admin')) {
          custs.push(INITIAL_DEMO_CUSTOMERS[5]); // Add Admin safely
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(custs));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_DEMO_CUSTOMERS));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_DEMO_ACCOUNTS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.FLAGS)) {
      localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify([]));
    }
  }

  // Retrieve all customers
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_DEMO_CUSTOMERS;
    } catch {
      return INITIAL_DEMO_CUSTOMERS;
    }
  }

  // Retrieve only retail bank customers (non-admin)
  public getRetailCustomers(): Customer[] {
    return this.getCustomers().filter((c) => c.role !== 'ADMIN');
  }

  // Retrieve all accounts
  public getAccounts(): Account[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return data ? JSON.parse(data) : INITIAL_DEMO_ACCOUNTS;
    } catch {
      return INITIAL_DEMO_ACCOUNTS;
    }
  }

  // Retrieve customer by ID
  public getCustomerById(customerId: number): Customer | undefined {
    return this.getCustomers().find((c) => c.customer_id === customerId);
  }

  // Retrieve customer by login username/email
  public getCustomerByLogin(identifier: string): Customer | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.getCustomers().find(
      (c) => c.username.toLowerCase() === clean || c.email.toLowerCase() === clean
    );
  }

  // Retrieve primary account for a customer
  public getAccountByCustomerId(customerId: number): Account | undefined {
    return this.getAccounts().find((a) => a.customer_id === customerId);
  }

  // Retrieve account by account number
  public getAccountByNumber(accountNumber: string): Account | undefined {
    return this.getAccounts().find((a) => a.account_number === accountNumber);
  }

  // Retrieve transactions for an account (ordered newest first)
  public getTransactions(accountNumber: string): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const all: Transaction[] = data ? JSON.parse(data) : [];
      return all
        .filter((t) => t.account_number === accountNumber)
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    } catch {
      return [];
    }
  }

  // Retrieve all transactions across entire bank (for Admin)
  public getAllTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const all: Transaction[] = data ? JSON.parse(data) : [];
      return all.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    } catch {
      return [];
    }
  }

  // Retrieve all flags for an account
  public getFlags(accountNumber: string): (TransactionFlag & { transaction?: Transaction })[] {
    try {
      const flagData = localStorage.getItem(STORAGE_KEYS.FLAGS);
      const allFlags: TransactionFlag[] = flagData ? JSON.parse(flagData) : [];
      const txns = this.getTransactions(accountNumber);
      const txnMap = new Map<string, Transaction>(txns.map((t) => [t.transaction_id, t]));

      return allFlags
        .filter((f) => txnMap.has(f.transaction_id))
        .map((f) => ({
          ...f,
          transaction: txnMap.get(f.transaction_id),
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return [];
    }
  }

  // Retrieve all system flags for Administrator
  public getAllSystemFlags(): (TransactionFlag & { account_number: string; customer_name: string; transaction?: Transaction })[] {
    try {
      const flagData = localStorage.getItem(STORAGE_KEYS.FLAGS);
      const allFlags: TransactionFlag[] = flagData ? JSON.parse(flagData) : [];
      const allTxns = this.getAllTransactions();
      const accounts = this.getAccounts();
      const customers = this.getCustomers();

      const txnMap = new Map<string, Transaction>(allTxns.map((t) => [t.transaction_id, t]));
      const acctMap = new Map<string, Account>(accounts.map((a) => [a.account_number, a]));
      const custMap = new Map<number, Customer>(customers.map((c) => [c.customer_id, c]));

      return allFlags.map((f) => {
        const txn = txnMap.get(f.transaction_id);
        const acct = txn ? acctMap.get(txn.account_number) : undefined;
        const cust = acct ? custMap.get(acct.customer_id) : undefined;
        return {
          ...f,
          account_number: txn?.account_number || 'N/A',
          customer_name: cust?.full_name || 'Demo Customer',
          transaction: txn,
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return [];
    }
  }

  // Register new customer
  public registerCustomer(fullName: string, username: string, email: string, password: string): { success: boolean; message: string; customer?: Customer; account?: Account } {
    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanUsername || !cleanEmail || !password) {
      return { success: false, message: 'All fields are required.' };
    }

    const customers = this.getCustomers();
    if (customers.some((c) => c.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Username is already taken.' };
    }
    if (customers.some((c) => c.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email address is already registered.' };
    }

    const newCustomerId = customers.length > 0 ? Math.max(...customers.map((c) => c.customer_id)) + 1 : 1;
    const newCustomer: Customer = {
      customer_id: newCustomerId,
      full_name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password_hash: password,
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    const accounts = this.getAccounts();
    const newAccountId = accounts.length > 0 ? Math.max(...accounts.map((a) => a.account_id)) + 1 : 1;
    const highestAcctNum = accounts.reduce((max, a) => {
      const num = parseInt(a.account_number, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 1005);
    const newAccountNumber = (highestAcctNum + 1).toString();

    const newAccount: Account = {
      account_id: newAccountId,
      account_number: newAccountNumber,
      customer_id: newCustomerId,
      account_type: 'Savings',
      balance: 0.0,
      created_at: new Date().toISOString(),
    };

    customers.push(newCustomer);
    accounts.push(newAccount);

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));

    return {
      success: true,
      message: `Account created successfully! Your Banklytics account number is ${newAccountNumber}.`,
      customer: newCustomer,
      account: newAccount,
    };
  }

  // Update customer profile
  public updateProfile(customerId: number, fullName: string, email: string): { success: boolean; message: string; customer?: Customer } {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.customer_id === customerId);
    if (idx === -1) {
      return { success: false, message: 'Customer record not found.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailConflict = customers.some((c) => c.customer_id !== customerId && c.email.toLowerCase() === cleanEmail);
    if (emailConflict) {
      return { success: false, message: 'Email is already used by another customer.' };
    }

    customers[idx].full_name = fullName.trim();
    customers[idx].email = cleanEmail;
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

    return { success: true, message: 'Profile updated successfully.', customer: customers[idx] };
  }

  // Deposit money atomically
  public deposit(accountNumber: string, rawAmount: number, description?: string): { success: boolean; message: string; transaction?: Transaction; newBalance?: number } {
    const amount = Math.round(Number(rawAmount) * 100) / 100;
    if (isNaN(amount) || amount <= 0) {
      return { success: false, message: 'Deposit amount must be a positive number greater than ₹0.' };
    }

    const accounts = this.getAccounts();
    const acctIdx = accounts.findIndex((a) => a.account_number === accountNumber);
    if (acctIdx === -1) {
      return { success: false, message: 'Account not found.' };
    }

    const currentBalance = accounts[acctIdx].balance;
    const newBalance = Math.round((currentBalance + amount) * 100) / 100;
    accounts[acctIdx].balance = newBalance;

    const txnId = `BNK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn: Transaction = {
      transaction_id: txnId,
      account_id: accounts[acctIdx].account_id,
      account_number: accountNumber,
      transaction_date: new Date().toISOString(),
      transaction_type: 'DEPOSIT',
      amount,
      description: description?.trim() || 'Simulated Deposit',
      balance_after: newBalance,
      status: 'COMPLETED',
    };

    const txns = this.getAllRawTransactions();
    txns.push(newTxn);

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));

    // Rule-based anomaly evaluation
    this.evaluateRules(newTxn);

    return {
      success: true,
      message: `Successfully deposited ₹${amount.toFixed(2)}. Updated balance: ₹${newBalance.toFixed(2)}.`,
      transaction: newTxn,
      newBalance,
    };
  }

  // Withdraw money atomically with strict balance checks
  public withdraw(accountNumber: string, rawAmount: number, description?: string): { success: boolean; message: string; transaction?: Transaction; newBalance?: number } {
    const amount = Math.round(Number(rawAmount) * 100) / 100;
    if (isNaN(amount) || amount <= 0) {
      return { success: false, message: 'Withdrawal amount must be a positive number greater than ₹0.' };
    }

    const accounts = this.getAccounts();
    const acctIdx = accounts.findIndex((a) => a.account_number === accountNumber);
    if (acctIdx === -1) {
      return { success: false, message: 'Account not found.' };
    }

    const currentBalance = accounts[acctIdx].balance;
    if (amount > currentBalance) {
      return {
        success: false,
        message: `Insufficient funds. Requested ₹${amount.toFixed(2)}, but your available balance is ₹${currentBalance.toFixed(2)}.`,
      };
    }

    const newBalance = Math.round((currentBalance - amount) * 100) / 100;
    accounts[acctIdx].balance = newBalance;

    const txnId = `BNK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn: Transaction = {
      transaction_id: txnId,
      account_id: accounts[acctIdx].account_id,
      account_number: accountNumber,
      transaction_date: new Date().toISOString(),
      transaction_type: 'WITHDRAWAL',
      amount,
      description: description?.trim() || 'Simulated Withdrawal',
      balance_after: newBalance,
      status: 'COMPLETED',
    };

    const txns = this.getAllRawTransactions();
    txns.push(newTxn);

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));

    this.evaluateRules(newTxn);

    return {
      success: true,
      message: `Successfully withdrew ₹${amount.toFixed(2)}. Updated balance: ₹${newBalance.toFixed(2)}.`,
      transaction: newTxn,
      newBalance,
    };
  }

  // Rule-based Anomaly Engine
  private evaluateRules(txn: Transaction) {
    const flags: TransactionFlag[] = this.getAllRawFlags();
    const history = this.getTransactions(txn.account_number);

    // Rule 1: High single transaction threshold (>= ₹25,000)
    const HIGH_VALUE_THRESHOLD = 25000;
    if (txn.amount >= HIGH_VALUE_THRESHOLD) {
      flags.push({
        flag_id: `FLG-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
        transaction_id: txn.transaction_id,
        rule_name: 'HIGH_VALUE_THRESHOLD',
        reason: `Transaction of ₹${txn.amount.toFixed(2)} meets or exceeds the demo threshold of ₹${HIGH_VALUE_THRESHOLD.toLocaleString('en-IN')}.`,
        review_status: 'PENDING_REVIEW',
        created_at: new Date().toISOString(),
      });
    }

    // Rule 2: Multiple rapid withdrawals (>= 3 withdrawals in a 60-minute window)
    if (txn.transaction_type === 'WITHDRAWAL') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).getTime();
      const recentWithdrawals = history.filter(
        (t) => t.transaction_type === 'WITHDRAWAL' && new Date(t.transaction_date).getTime() >= oneHourAgo
      );

      if (recentWithdrawals.length >= 3) {
        flags.push({
          flag_id: `FLG-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
          transaction_id: txn.transaction_id,
          rule_name: 'RAPID_WITHDRAWALS_VELOCITY',
          reason: `Account executed ${recentWithdrawals.length} withdrawals within a 1-hour window. Flagged for educational velocity review.`,
          review_status: 'PENDING_REVIEW',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Rule 3: Spike anomaly (> 3x historical average transaction amount with >= 3 historical transactions)
    const previousTxns = history.filter((t) => t.transaction_id !== txn.transaction_id);
    if (previousTxns.length >= 3) {
      const avgAmount = previousTxns.reduce((sum, t) => sum + t.amount, 0) / previousTxns.length;
      if (txn.amount > 3 * avgAmount && txn.amount > 5000) {
        flags.push({
          flag_id: `FLG-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
          transaction_id: txn.transaction_id,
          rule_name: 'HISTORICAL_DEVIATION_SPIKE',
          reason: `Amount (₹${txn.amount.toFixed(2)}) is over 3x the account's historical average transaction size (₹${avgAmount.toFixed(2)}).`,
          review_status: 'PENDING_REVIEW',
          created_at: new Date().toISOString(),
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(flags));
  }

  // Update flag review status
  public updateFlagStatus(flagId: string, status: 'REVIEWED' | 'DISMISSED'): boolean {
    const flags = this.getAllRawFlags();
    const idx = flags.findIndex((f) => f.flag_id === flagId);
    if (idx !== -1) {
      flags[idx].review_status = status;
      localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(flags));
      return true;
    }
    return false;
  }

  // Compute Pandas/NumPy-style Analytics for an account
  public computeAnalytics(accountNumber: string): AnalyticsStats {
    const txns = this.getTransactions(accountNumber);
    const chronological = [...txns].sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let depositCount = 0;
    let withdrawalCount = 0;
    let highestDeposit = 0;
    let highestWithdrawal = 0;

    for (const t of txns) {
      if (t.transaction_type === 'DEPOSIT') {
        totalDeposits += t.amount;
        depositCount += 1;
        if (t.amount > highestDeposit) highestDeposit = t.amount;
      } else {
        totalWithdrawals += t.amount;
        withdrawalCount += 1;
        if (t.amount > highestWithdrawal) highestWithdrawal = t.amount;
      }
    }

    const netBalanceChange = Math.round((totalDeposits - totalWithdrawals) * 100) / 100;
    const avgTransaction = txns.length > 0 ? Math.round(((totalDeposits + totalWithdrawals) / txns.length) * 100) / 100 : 0;

    // Monthly grouping
    const monthlyMap = new Map<string, { deposits: number; withdrawals: number; closing: number }>();
    for (const t of chronological) {
      const d = new Date(t.transaction_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { deposits: 0, withdrawals: 0, closing: 0 });
      }
      const entry = monthlyMap.get(key)!;
      if (t.transaction_type === 'DEPOSIT') {
        entry.deposits += t.amount;
      } else {
        entry.withdrawals += t.amount;
      }
      entry.closing = t.balance_after;
    }

    const monthlyTrends: AnalyticsStats['monthly_trends'] = [];
    if (monthlyMap.size === 0) {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthlyTrends.push({
          month_key: key,
          month_name: monthName,
          deposits: 0,
          withdrawals: 0,
          net_flow: 0,
          closing_balance: 0,
        });
      }
    } else {
      for (const [key, val] of monthlyMap.entries()) {
        const [year, month] = key.split('-').map(Number);
        const d = new Date(year, month - 1, 1);
        const monthName = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthlyTrends.push({
          month_key: key,
          month_name: monthName,
          deposits: Math.round(val.deposits * 100) / 100,
          withdrawals: Math.round(val.withdrawals * 100) / 100,
          net_flow: Math.round((val.deposits - val.withdrawals) * 100) / 100,
          closing_balance: val.closing,
        });
      }
    }

    return {
      total_deposits: Math.round(totalDeposits * 100) / 100,
      total_withdrawals: Math.round(totalWithdrawals * 100) / 100,
      net_balance_change: netBalanceChange,
      transaction_count: txns.length,
      deposit_count: depositCount,
      withdrawal_count: withdrawalCount,
      average_transaction: avgTransaction,
      highest_deposit: highestDeposit,
      highest_withdrawal: highestWithdrawal,
      monthly_trends: monthlyTrends,
    };
  }

  // Smart Financial Insights Generator (Section 7)
  public generateSmartInsights(accountNumber: string): SmartInsights {
    const stats = this.computeAnalytics(accountNumber);
    const trends = stats.monthly_trends.filter((m) => m.deposits > 0 || m.withdrawals > 0);

    const insightsList: SmartInsights['insights_list'] = [];
    let depositChange: SmartInsights['deposit_change'];
    let withdrawalChange: SmartInsights['withdrawal_change'];
    let highestActivityMonth: SmartInsights['highest_activity_month'];

    if (trends.length >= 2) {
      const currentMonth = trends[trends.length - 1];
      const previousMonth = trends[trends.length - 2];

      // Deposit MoM comparison
      const depDiff = currentMonth.deposits - previousMonth.deposits;
      const depPct = previousMonth.deposits > 0 ? (depDiff / previousMonth.deposits) * 100 : 100;
      depositChange = {
        diff_amount: Math.abs(Math.round(depDiff * 100) / 100),
        diff_percent: Math.abs(Math.round(depPct * 10) / 10),
        increased: depDiff >= 0,
        text: depDiff >= 0
          ? `Deposits increased by ${Math.abs(Math.round(depPct))}% compared with ${previousMonth.month_name}.`
          : `Deposits decreased by ${Math.abs(Math.round(depPct))}% compared with ${previousMonth.month_name}.`,
      };

      insightsList.push({
        id: 'mom-deposits',
        title: depositChange.increased ? 'Inflow Acceleration' : 'Lower Inflow Rate',
        description: depositChange.text,
        badge: depositChange.increased ? '+ Inflow' : '- Inflow',
        type: depositChange.increased ? 'positive' : 'neutral',
      });

      // Withdrawal MoM comparison
      const withDiff = currentMonth.withdrawals - previousMonth.withdrawals;
      const withPct = previousMonth.withdrawals > 0 ? (withDiff / previousMonth.withdrawals) * 100 : (withDiff > 0 ? 100 : 0);
      withdrawalChange = {
        diff_amount: Math.abs(Math.round(withDiff * 100) / 100),
        diff_percent: Math.abs(Math.round(withPct * 10) / 10),
        increased: withDiff > 0,
        text: withDiff > 0
          ? `Expenditures rose by ${Math.abs(Math.round(withPct))}% vs ${previousMonth.month_name}.`
          : `Expenditures decreased by ${Math.abs(Math.round(withPct))}% vs ${previousMonth.month_name}.`,
      };

      insightsList.push({
        id: 'mom-withdrawals',
        title: withDiff > 0 ? 'Outflow Spike Detected' : 'Prudent Expense Management',
        description: withdrawalChange.text,
        badge: withDiff > 0 ? 'Outflow Alert' : 'Disciplined',
        type: withDiff > 0 ? 'warning' : 'positive',
      });
    }

    // Find highest transaction volume month
    if (trends.length > 0) {
      let maxMonth = trends[0];
      let maxVol = maxMonth.deposits + maxMonth.withdrawals;
      for (const m of trends) {
        const vol = m.deposits + m.withdrawals;
        if (vol > maxVol) {
          maxVol = vol;
          maxMonth = m;
        }
      }
      highestActivityMonth = {
        month_name: maxMonth.month_name,
        volume: maxVol,
        count: stats.transaction_count,
      };

      insightsList.push({
        id: 'peak-month',
        title: 'Peak Transaction Period',
        description: `${maxMonth.month_name} generated the highest aggregate financial throughput of ₹${maxVol.toLocaleString('en-IN')}.`,
        badge: 'Peak Activity',
        type: 'neutral',
      });
    }

    // Average transaction insights
    if (stats.transaction_count > 0) {
      insightsList.push({
        id: 'avg-ticket',
        title: 'Average Transaction Velocity',
        description: `Across ${stats.transaction_count} recorded transactions, your mean operation size is ₹${stats.average_transaction.toLocaleString('en-IN')}.`,
        badge: 'Ticket Size',
        type: 'neutral',
      });
    }

    // Cash flow health status
    let health: SmartInsights['cash_flow_health'] = 'INACTIVE';
    if (stats.transaction_count > 0) {
      if (stats.net_balance_change > 0) {
        health = 'POSITIVE_SURPLUS';
        insightsList.push({
          id: 'surplus',
          title: 'Positive Cash Reserve Surplus',
          description: `Total deposits exceed outflows by ₹${stats.net_balance_change.toLocaleString('en-IN')}, maintaining a positive liquid reserve.`,
          badge: 'Healthy Ledger',
          type: 'positive',
        });
      } else if (stats.net_balance_change === 0) {
        health = 'BALANCED';
      } else {
        health = 'DEFICIT';
      }
    }

    return {
      deposit_change: depositChange,
      withdrawal_change: withdrawalChange,
      highest_activity_month: highestActivityMonth,
      average_ticket_text: stats.transaction_count > 0 ? `₹${stats.average_transaction.toFixed(2)}` : '₹0.00',
      cash_flow_health: health,
      insights_list: insightsList,
    };
  }

  // Monthly Report Generator
  public getMonthlyReport(accountNumber: string, year: number, month: number): { summary: MonthlySummary; transactions: Transaction[] } {
    const allTxns = this.getTransactions(accountNumber);
    const chronological = [...allTxns].sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    let openingBalance = 0;
    const priorTxns = chronological.filter((t) => new Date(t.transaction_date).getTime() < startDate.getTime());
    if (priorTxns.length > 0) {
      openingBalance = priorTxns[priorTxns.length - 1].balance_after;
    }

    const monthTxns = chronological.filter((t) => {
      const time = new Date(t.transaction_date).getTime();
      return time >= startDate.getTime() && time <= endDate.getTime();
    });

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    for (const t of monthTxns) {
      if (t.transaction_type === 'DEPOSIT') {
        totalDeposits += t.amount;
      } else {
        totalWithdrawals += t.amount;
      }
    }

    const netChange = Math.round((totalDeposits - totalWithdrawals) * 100) / 100;
    const closingBalance = monthTxns.length > 0 ? monthTxns[monthTxns.length - 1].balance_after : openingBalance;
    const monthName = startDate.toLocaleString('en-US', { month: 'long' });

    return {
      summary: {
        month,
        year,
        month_name: `${monthName} ${year}`,
        opening_balance: Math.round(openingBalance * 100) / 100,
        total_deposits: Math.round(totalDeposits * 100) / 100,
        total_withdrawals: Math.round(totalWithdrawals * 100) / 100,
        closing_balance: Math.round(closingBalance * 100) / 100,
        net_change: netChange,
        transaction_count: monthTxns.length,
      },
      transactions: monthTxns.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()),
    };
  }

  // Admin Dashboard Aggregate Data
  public getAdminDashboardData(): AdminDashboardData {
    const customers = this.getRetailCustomers();
    const accounts = this.getAccounts();
    const transactions = this.getAllTransactions();
    const flags = this.getAllSystemFlags();

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let systemBalance = 0;

    for (const a of accounts) {
      systemBalance += a.balance;
    }

    for (const t of transactions) {
      if (t.transaction_type === 'DEPOSIT') {
        totalDeposits += t.amount;
      } else {
        totalWithdrawals += t.amount;
      }
    }

    const customersList = customers.map((c) => {
      const acct = accounts.find((a) => a.customer_id === c.customer_id) || {
        account_id: c.customer_id,
        account_number: (1000 + c.customer_id).toString(),
        customer_id: c.customer_id,
        account_type: 'Savings' as const,
        balance: 0.0,
        created_at: c.created_at,
      };
      const txnCount = transactions.filter((t) => t.account_number === acct.account_number).length;
      return { customer: c, account: acct, transaction_count: txnCount };
    });

    const unresolvedFlags = flags.filter((f) => f.review_status === 'PENDING_REVIEW').length;

    return {
      total_customers: customers.length,
      total_accounts: accounts.length,
      total_deposits_volume: Math.round(totalDeposits * 100) / 100,
      total_withdrawals_volume: Math.round(totalWithdrawals * 100) / 100,
      total_transactions_count: transactions.length,
      system_balance_held: Math.round(systemBalance * 100) / 100,
      unresolved_flags_count: unresolvedFlags,
      customers_list: customersList,
      system_transactions: transactions.slice(0, 20),
      system_flags: flags,
    };
  }

  // Seed sample educational dataset
  public seedSampleDataset(accountNumber: string) {
    const acct = this.getAccountByNumber(accountNumber);
    if (!acct) return;

    const allTxns = this.getAllRawTransactions().filter((t) => t.account_number !== accountNumber);
    const allFlags = this.getAllRawFlags();

    let balance = 0;
    const sampleData = [
      { type: 'DEPOSIT', amount: 50000, desc: 'Initial Grant / Research Honorarium', daysAgo: 50 },
      { type: 'WITHDRAWAL', amount: 12000, desc: 'Coworking Office Rental Payment', daysAgo: 42 },
      { type: 'DEPOSIT', amount: 18500, desc: 'Client Financial Consulting Receipt', daysAgo: 35 },
      { type: 'WITHDRAWAL', amount: 4200, desc: 'Cloud Infrastructure & High-Compute Servers', daysAgo: 28 },
      { type: 'WITHDRAWAL', amount: 1850, desc: 'Telecom & High-Speed Fiber Internet Bill', daysAgo: 20 },
      { type: 'DEPOSIT', amount: 32000, desc: 'Quarterly Academic Fellowship Stipend', daysAgo: 14 },
      { type: 'WITHDRAWAL', amount: 6500, desc: 'Professional Development & Textbooks', daysAgo: 8 },
      { type: 'WITHDRAWAL', amount: 28000, desc: 'Large Scientific Hardware Lease Deposit', daysAgo: 3 }, // Rule 1 trigger
      { type: 'WITHDRAWAL', amount: 2100, desc: 'Campus Stationery & Supplies', daysAgo: 2 },
      { type: 'DEPOSIT', amount: 11200, desc: 'Reimbursement for Travel & Presentation', daysAgo: 0 },
    ];

    const generatedTxns: Transaction[] = [];
    const now = Date.now();

    for (let i = 0; i < sampleData.length; i++) {
      const item = sampleData[i];
      const d = new Date(now - item.daysAgo * 24 * 60 * 60 * 1000 - i * 1000 * 60);
      if (item.type === 'DEPOSIT') {
        balance += item.amount;
      } else {
        balance -= item.amount;
      }
      balance = Math.round(balance * 100) / 100;

      const txn: Transaction = {
        transaction_id: `BNK-SAMPLE-${1000 + i}`,
        account_id: acct.account_id,
        account_number: accountNumber,
        transaction_date: d.toISOString(),
        transaction_type: item.type as 'DEPOSIT' | 'WITHDRAWAL',
        amount: item.amount,
        description: item.desc,
        balance_after: balance,
        status: 'COMPLETED',
      };
      generatedTxns.push(txn);
    }

    const accounts = this.getAccounts();
    const acctIdx = accounts.findIndex((a) => a.account_number === accountNumber);
    if (acctIdx !== -1) {
      accounts[acctIdx].balance = balance;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }

    const combinedTxns = [...allTxns, ...generatedTxns];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(combinedTxns));

    for (const txn of generatedTxns) {
      if (txn.amount >= 25000) {
        allFlags.push({
          flag_id: `FLG-SAMPLE-${txn.transaction_id}`,
          transaction_id: txn.transaction_id,
          rule_name: 'HIGH_VALUE_THRESHOLD',
          reason: `Transaction amount of ₹${txn.amount.toFixed(2)} exceeds demo threshold of ₹25,000.`,
          review_status: 'PENDING_REVIEW',
          created_at: txn.transaction_date,
        });
      }
    }
    localStorage.setItem(STORAGE_KEYS.FLAGS, JSON.stringify(allFlags));
  }

  // Reset account to initial ₹0 balance
  public resetAccount(accountNumber: string) {
    const accounts = this.getAccounts();
    const acctIdx = accounts.findIndex((a) => a.account_number === accountNumber);
    if (acctIdx !== -1) {
      accounts[acctIdx].balance = 0.0;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }

    const txns = this.getAllRawTransactions().filter((t) => t.account_number !== accountNumber);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  }

  // Session persistence
  public getSessionUserId(): number | null {
    const id = localStorage.getItem(STORAGE_KEYS.SESSION_USER);
    return id ? parseInt(id, 10) : 1;
  }

  public setSessionUserId(customerId: number | null) {
    if (customerId === null) {
      localStorage.removeItem(STORAGE_KEYS.SESSION_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION_USER, customerId.toString());
    }
  }

  // Theme preferences (Light / Dark)
  public getTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light') || 'dark';
  }

  public setTheme(theme: 'dark' | 'light') {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  private getAllRawTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getAllRawFlags(): TransactionFlag[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLAGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const db = new BankingDatabase();
