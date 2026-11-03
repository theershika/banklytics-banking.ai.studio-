import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { Customer, Account } from '../types/banking';
import { db } from '../services/storage';

interface AuthViewProps {
  onLoginSuccess: (customer: Customer) => void;
  allCustomers: Customer[];
  allAccounts: Account[];
  theme?: 'dark' | 'light';
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  allCustomers,
  allAccounts,
  theme = 'dark',
}) => {
  const [activeMode, setActiveMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [loginIdentifier, setLoginIdentifier] = useState('demouser1');
  const [loginPassword, setLoginPassword] = useState('Demo@1001');

  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const customer = db.getCustomerByLogin(loginIdentifier);
    if (!customer) {
      setErrorMsg('No account found with this username or email.');
      return;
    }

    if (customer.password_hash !== loginPassword) {
      setErrorMsg('Invalid password. For demo accounts 1001-1005, use password Demo@1001 to Demo@1005.');
      return;
    }

    onLoginSuccess(customer);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const res = db.registerCustomer(regFullName, regUsername, regEmail, regPassword);
    if (res.success && res.customer) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onLoginSuccess(res.customer!);
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickDemoSelect = (customerId: number) => {
    const cust = db.getCustomerById(customerId);
    if (cust) {
      setLoginIdentifier(cust.username);
      setLoginPassword(cust.role === 'ADMIN' ? 'Admin@Banklytics2026' : `Demo@${1000 + customerId}`);
      onLoginSuccess(cust);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20 mb-3 font-mono font-bold text-white text-lg">
          BK
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight font-mono">
          BANK<span className="text-cyan-400">LYTICS</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Smart Banking. Smarter Insights. • Academic Project 16
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
        <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveMode('LOGIN');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeMode === 'LOGIN'
                ? 'bg-cyan-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('REGISTER');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeMode === 'REGISTER'
                ? 'bg-cyan-600 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Demo Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeMode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. demouser1 or demo1@banklytics.edu"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>Sign In to Banklytics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Maya Deshmukh"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g. maya_sim"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. maya@college.edu"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                <span>Register Demo Account (Initial ₹0)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Examiner 1-Click Access */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Examiner 1-Click Logins</span>
            </span>
            <button
              onClick={() => handleQuickDemoSelect(99)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
            >
              Admin &rarr;
            </button>
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleQuickDemoSelect(id)}
                className="bg-slate-950 hover:bg-blue-900/40 hover:border-blue-500 text-slate-300 hover:text-cyan-300 border border-slate-800 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors"
                title={`Login as Demo Customer ${id}`}
              >
                #{1000 + id}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Credentials: <code className="text-cyan-400 font-mono">Demo@1001</code> to <code className="text-cyan-400 font-mono">Demo@1005</code>
          </p>
        </div>
      </div>
    </div>
  );
};
