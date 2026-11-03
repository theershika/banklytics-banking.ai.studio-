import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  BarChart3,
  FileText,
  AlertTriangle,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Lock,
  Building2
} from 'lucide-react';
import { Customer, Account } from '../types/banking';
import { formatINR } from '../utils/exportUtils';

interface NavbarProps {
  currentCustomer: Customer | null;
  currentAccount: Account | null;
  allCustomers: Customer[];
  allAccounts: Account[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSwitchCustomer: (customerId: number) => void;
  onOpenCodeExplorer?: () => void;
  flagCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCustomer,
  currentAccount,
  allCustomers,
  allAccounts,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchCustomer,
  onOpenCodeExplorer,
  flagCount,
  theme,
  onToggleTheme,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentCustomer?.role === 'ADMIN';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Wallet },
    { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'reports', label: 'Statements', icon: FileText },
    {
      id: 'flags',
      label: 'Flags',
      icon: AlertTriangle,
      badge: flagCount > 0 ? flagCount : null,
    },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Ops', icon: Lock }] : []),
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 focus:outline-none group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <span className="font-mono font-bold text-sm text-white">BK</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                    BANK<span className="text-cyan-400">LYTICS</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.2 rounded font-sans font-medium">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Smart Banking. Smarter Insights.</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          {currentCustomer && (
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Header Area: Theme Toggle & Demo Switcher & Account Badge */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-300" />}
            </button>

            {currentCustomer ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 text-left text-xs text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    {isAdmin ? 'AD' : currentCustomer.customer_id}
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-semibold text-slate-200 leading-tight truncate max-w-[130px]">
                      {currentCustomer.full_name}
                    </div>
                    <div className="text-[11px] text-cyan-400 font-mono">
                      {isAdmin ? 'System Administrator' : `Acct #${currentAccount?.account_number} • ${formatINR(currentAccount?.balance || 0)}`}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Session</p>
                      <p className="font-medium text-white text-sm">{currentCustomer.full_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{currentCustomer.email}</p>
                      {!isAdmin && currentAccount && (
                        <p className="text-xs text-cyan-400 font-mono mt-0.5">
                          Balance: <span className="font-bold">{formatINR(currentAccount.balance)}</span>
                        </p>
                      )}
                    </div>

                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        <span>Quick Demo Switch (1001 - 1005)</span>
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {allCustomers.filter((c) => c.role !== 'ADMIN').slice(0, 5).map((cust) => {
                          const acct = allAccounts.find((a) => a.customer_id === cust.customer_id);
                          const isCurrent = cust.customer_id === currentCustomer.customer_id;
                          return (
                            <button
                              key={cust.customer_id}
                              onClick={() => {
                                onSwitchCustomer(cust.customer_id);
                                setDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                isCurrent
                                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/30 font-semibold'
                                  : 'hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-cyan-400 font-bold">#{acct?.account_number || cust.customer_id}</span>
                                <span className="truncate">{cust.full_name}</span>
                              </div>
                              <span className="font-mono text-[11px] text-slate-400 shrink-0">
                                {formatINR(acct?.balance || 0)}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Admin Switcher Item */}
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            const adminUser = allCustomers.find((c) => c.role === 'ADMIN');
                            if (adminUser) {
                              onSwitchCustomer(adminUser.customer_id);
                              setActiveTab('admin');
                            }
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                            isAdmin
                              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                              : 'hover:bg-indigo-950/40 text-indigo-400 border border-indigo-900/40'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Administrator Console</span>
                          </span>
                          <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded">RBAC</span>
                        </button>
                      </div>
                    </div>

                    <div className="px-2 pt-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile & Data Management</span>
                      </button>
                      <button
                        onClick={() => {
                          onLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('auth')}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Sign In / Demo
              </button>
            )}

            {/* Mobile menu toggle */}
            {currentCustomer && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && currentCustomer && (
        <div className="xl:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
