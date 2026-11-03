import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { DepositView } from './components/DepositView';
import { WithdrawView } from './components/WithdrawView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SmartInsightsView } from './components/SmartInsightsView';
import { MonthlyReportsView } from './components/MonthlyReportsView';
import { FlagsView } from './components/FlagsView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { AuthView } from './components/AuthView';
import { CodeExplorerModal } from './components/CodeExplorerModal';

import { db } from './services/storage';
import { Customer, Account, Transaction, TransactionFlag } from './types/banking';
import { exportTransactionsToCSV } from './utils/exportUtils';

export default function App() {
  const [versionKey, setVersionKey] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentCustomerId, setCurrentCustomerId] = useState<number | null>(() => db.getSessionUserId());
  const [codeExplorerOpen, setCodeExplorerOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => db.getTheme());

  useEffect(() => {
    db.init();
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    db.setTheme(next);
  };

  const allCustomers = useMemo(() => db.getCustomers(), [versionKey]);
  const allAccounts = useMemo(() => db.getAccounts(), [versionKey]);

  const currentCustomer = useMemo(() => {
    if (!currentCustomerId) return null;
    return allCustomers.find((c) => c.customer_id === currentCustomerId) || null;
  }, [currentCustomerId, allCustomers]);

  const currentAccount = useMemo(() => {
    if (!currentCustomer) return null;
    return allAccounts.find((a) => a.customer_id === currentCustomer.customer_id) || null;
  }, [currentCustomer, allAccounts]);

  const transactions = useMemo(() => {
    if (!currentAccount) return [];
    return db.getTransactions(currentAccount.account_number);
  }, [currentAccount, versionKey]);

  const analyticsStats = useMemo(() => {
    if (!currentAccount) {
      return {
        total_deposits: 0,
        total_withdrawals: 0,
        net_balance_change: 0,
        transaction_count: 0,
        deposit_count: 0,
        withdrawal_count: 0,
        average_transaction: 0,
        highest_deposit: 0,
        highest_withdrawal: 0,
        monthly_trends: [],
      };
    }
    return db.computeAnalytics(currentAccount.account_number);
  }, [currentAccount, versionKey]);

  const smartInsights = useMemo(() => {
    if (!currentAccount) {
      return {
        average_ticket_text: '₹0.00',
        cash_flow_health: 'INACTIVE' as const,
        insights_list: [],
      };
    }
    return db.generateSmartInsights(currentAccount.account_number);
  }, [currentAccount, versionKey]);

  const flags = useMemo(() => {
    if (!currentAccount) return [];
    return db.getFlags(currentAccount.account_number);
  }, [currentAccount, versionKey]);

  const pendingFlagsCount = useMemo(() => {
    return flags.filter((f) => f.review_status === 'PENDING_REVIEW').length;
  }, [flags]);

  const adminData = useMemo(() => {
    return db.getAdminDashboardData();
  }, [versionKey]);

  // Handlers
  const handleSwitchCustomer = (customerId: number) => {
    db.setSessionUserId(customerId);
    setCurrentCustomerId(customerId);
    const target = db.getCustomerById(customerId);
    if (target?.role === 'ADMIN') {
      setActiveTab('admin');
    } else if (activeTab === 'admin') {
      setActiveTab('dashboard');
    }
    setVersionKey((k) => k + 1);
  };

  const handleLoginSuccess = (customer: Customer) => {
    db.setSessionUserId(customer.customer_id);
    setCurrentCustomerId(customer.customer_id);
    if (customer.role === 'ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
    setVersionKey((k) => k + 1);
  };

  const handleLogout = () => {
    db.setSessionUserId(null);
    setCurrentCustomerId(null);
    setActiveTab('landing');
  };

  const handleDeposit = (amount: number, description: string) => {
    if (!currentAccount) return { success: false, message: 'No active account selected.' };
    const res = db.deposit(currentAccount.account_number, amount, description);
    if (res.success) {
      setVersionKey((k) => k + 1);
    }
    return res;
  };

  const handleWithdraw = (amount: number, description: string) => {
    if (!currentAccount) return { success: false, message: 'No active account selected.' };
    const res = db.withdraw(currentAccount.account_number, amount, description);
    if (res.success) {
      setVersionKey((k) => k + 1);
    }
    return res;
  };

  const handleUpdateFlagStatus = (flagId: string, status: 'REVIEWED' | 'DISMISSED') => {
    db.updateFlagStatus(flagId, status);
    setVersionKey((k) => k + 1);
  };

  const handleUpdateProfile = (name: string, email: string) => {
    if (!currentCustomer) return { success: false, message: 'No active customer.' };
    const res = db.updateProfile(currentCustomer.customer_id, name, email);
    if (res.success) {
      setVersionKey((k) => k + 1);
    }
    return res;
  };

  const handleResetAccount = () => {
    if (!currentAccount) return;
    db.resetAccount(currentAccount.account_number);
    setVersionKey((k) => k + 1);
  };

  const handleSeedSampleData = () => {
    if (!currentAccount) return;
    db.seedSampleDataset(currentAccount.account_number);
    setVersionKey((k) => k + 1);
  };

  const handleExportCSV = () => {
    if (!currentAccount) return;
    exportTransactionsToCSV(transactions, currentAccount.account_number);
  };

  const demoAccountsData = useMemo(() => {
    return allCustomers.filter((c) => c.role !== 'ADMIN').slice(0, 5).map((cust) => ({
      customer: cust,
      account: allAccounts.find((a) => a.customer_id === cust.customer_id) || {
        account_id: cust.customer_id,
        account_number: (1000 + cust.customer_id).toString(),
        customer_id: cust.customer_id,
        account_type: 'Savings' as const,
        balance: 0.0,
        created_at: cust.created_at,
      },
    }));
  }, [allCustomers, allAccounts]);

  const isAdmin = currentCustomer?.role === 'ADMIN';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950' : 'bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white'
    }`}>
      {/* Top Navbar */}
      <Navbar
        currentCustomer={currentCustomer}
        currentAccount={currentAccount}
        allCustomers={allCustomers}
        allAccounts={allAccounts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSwitchCustomer={handleSwitchCustomer}
        onOpenCodeExplorer={() => setCodeExplorerOpen(true)}
        flagCount={pendingFlagsCount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' || (!currentCustomer && activeTab !== 'auth') ? (
          <LandingPage
            onGetStarted={() => setActiveTab('auth')}
            onSelectDemoCustomer={(id) => {
              handleSwitchCustomer(id);
              if (id === 99) {
                setActiveTab('admin');
              } else {
                setActiveTab('dashboard');
              }
            }}
            onOpenCodeExplorer={() => setCodeExplorerOpen(true)}
            demoAccounts={demoAccountsData}
            theme={theme}
          />
        ) : activeTab === 'auth' ? (
          <AuthView
            onLoginSuccess={handleLoginSuccess}
            allCustomers={allCustomers}
            allAccounts={allAccounts}
            theme={theme}
          />
        ) : currentCustomer ? (
          <>
            {/* Admin view requires ADMIN role */}
            {activeTab === 'admin' && (
              isAdmin ? (
                <AdminView
                  adminData={adminData}
                  onUpdateFlagStatus={handleUpdateFlagStatus}
                  theme={theme}
                />
              ) : (
                <div className="p-8 text-center bg-slate-900 border border-rose-500/30 rounded-2xl">
                  <p className="text-rose-400 font-bold">Access Denied: Administrator role required.</p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-3 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )
            )}

            {currentAccount && activeTab === 'dashboard' && (
              <DashboardView
                customer={currentCustomer}
                account={currentAccount}
                transactions={transactions}
                stats={analyticsStats}
                flags={flags}
                setActiveTab={setActiveTab}
                onExportCSV={handleExportCSV}
                onSeedSampleData={handleSeedSampleData}
                theme={theme}
              />
            )}

            {currentAccount && activeTab === 'deposit' && (
              <DepositView
                account={currentAccount}
                customerName={currentCustomer.full_name}
                onDeposit={handleDeposit}
                onSuccessNavigate={() => setActiveTab('dashboard')}
                theme={theme}
              />
            )}

            {currentAccount && activeTab === 'withdraw' && (
              <WithdrawView
                account={currentAccount}
                customerName={currentCustomer.full_name}
                onWithdraw={handleWithdraw}
                onSuccessNavigate={() => setActiveTab('dashboard')}
                theme={theme}
              />
            )}

            {currentAccount && activeTab === 'transactions' && (
              <TransactionsView
                accountNumber={currentAccount.account_number}
                customerName={currentCustomer.full_name}
                accountType={currentAccount.account_type}
                transactions={transactions}
                onExportCSV={handleExportCSV}
                theme={theme}
              />
            )}

            {currentAccount && activeTab === 'analytics' && (
              <AnalyticsView
                stats={analyticsStats}
                accountNumber={currentAccount.account_number}
                onSeedSampleData={handleSeedSampleData}
                theme={theme}
              />
            )}

            {currentAccount && activeTab === 'insights' && (
              <SmartInsightsView
                insights={smartInsights}
                stats={analyticsStats}
                accountNumber={currentAccount.account_number}
                theme={theme}
              />
            )}

            {currentAccount && activeTab === 'reports' && (
              <MonthlyReportsView
                customer={currentCustomer}
                account={currentAccount}
                theme={theme}
              />
            )}

            {currentAccount && activeTab === 'flags' && (
              <FlagsView
                flags={flags}
                accountNumber={currentAccount.account_number}
                onUpdateStatus={handleUpdateFlagStatus}
              />
            )}

            {currentAccount && activeTab === 'profile' && (
              <ProfileView
                customer={currentCustomer}
                account={currentAccount}
                onUpdateProfile={handleUpdateProfile}
                onResetAccount={handleResetAccount}
                onSeedSampleData={handleSeedSampleData}
              />
            )}
          </>
        ) : null}
      </main>

      <CodeExplorerModal
        isOpen={codeExplorerOpen}
        onClose={() => setCodeExplorerOpen(false)}
      />
    </div>
  );
}
