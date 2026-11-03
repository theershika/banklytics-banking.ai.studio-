export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type ReviewStatus = 'PENDING_REVIEW' | 'REVIEWED' | 'DISMISSED';
export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface Customer {
  customer_id: number;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  role?: UserRole;
  created_at: string;
}

export interface Account {
  account_id: number;
  account_number: string;
  customer_id: number;
  account_type: 'Savings' | 'Current';
  balance: number;
  created_at: string;
}

export interface Transaction {
  transaction_id: string;
  account_id: number;
  account_number: string;
  transaction_date: string; // ISO UTC format
  transaction_type: TransactionType;
  amount: number;
  description: string;
  balance_after: number;
  status?: 'COMPLETED' | 'FLAGGED';
}

export interface TransactionFlag {
  flag_id: string;
  transaction_id: string;
  rule_name: string;
  reason: string;
  review_status: ReviewStatus;
  created_at: string;
}

export interface MonthlySummary {
  month: number;
  year: number;
  month_name: string;
  opening_balance: number;
  total_deposits: number;
  total_withdrawals: number;
  closing_balance: number;
  net_change: number;
  transaction_count: number;
}

export interface AnalyticsStats {
  total_deposits: number;
  total_withdrawals: number;
  net_balance_change: number;
  transaction_count: number;
  deposit_count: number;
  withdrawal_count: number;
  average_transaction: number;
  highest_deposit: number;
  highest_withdrawal: number;
  monthly_trends: {
    month_key: string;
    month_name: string;
    deposits: number;
    withdrawals: number;
    net_flow: number;
    closing_balance: number;
  }[];
}

export interface SmartInsights {
  deposit_change?: {
    diff_amount: number;
    diff_percent: number;
    increased: boolean;
    text: string;
  };
  withdrawal_change?: {
    diff_amount: number;
    diff_percent: number;
    increased: boolean;
    text: string;
  };
  highest_activity_month?: {
    month_name: string;
    volume: number;
    count: number;
  };
  average_ticket_text: string;
  cash_flow_health: 'POSITIVE_SURPLUS' | 'BALANCED' | 'DEFICIT' | 'INACTIVE';
  insights_list: {
    id: string;
    title: string;
    description: string;
    badge: string;
    type: 'positive' | 'warning' | 'neutral';
  }[];
}

export interface AdminDashboardData {
  total_customers: number;
  total_accounts: number;
  total_deposits_volume: number;
  total_withdrawals_volume: number;
  total_transactions_count: number;
  system_balance_held: number;
  unresolved_flags_count: number;
  customers_list: {
    customer: Customer;
    account: Account;
    transaction_count: number;
  }[];
  system_transactions: Transaction[];
  system_flags: (TransactionFlag & { account_number: string; customer_name: string })[];
}
