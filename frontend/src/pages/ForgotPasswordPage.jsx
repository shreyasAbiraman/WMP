import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res?.success) {
        setResult(res.data);
        toast.success('Password reset instructions generated.');
      }
    } catch (err) {
      toast.error(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-slate-100 dark:from-charcoal-950 dark:via-charcoal-900 dark:to-charcoal-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-700 flex items-center justify-center text-white mb-3 shadow-md shadow-purple-900/20">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter your registered email to receive recovery instructions
          </p>
        </div>

        {result ? (
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Reset Token Generated</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">{result.note}</p>
            {result.resetToken && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-800 font-mono text-[11px] break-all select-all">
                Token: <strong>{result.resetToken}</strong>
              </div>
            )}
            <Link
              to="/reset-password"
              className="block w-full py-2.5 text-center bg-purple-700 text-white font-bold rounded-xl shadow-sm hover:bg-purple-800 transition"
            >
              Proceed to Enter Token →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
