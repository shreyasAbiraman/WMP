import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldAlert,
  Navigation,
  MapPin,
  Lock,
  PhoneCall,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BotMessageSquare,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-slate-50 dark:from-charcoal-950 dark:via-charcoal-900 dark:to-charcoal-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="border-b border-purple-100/60 dark:border-slate-800 backdrop-blur-md sticky top-0 z-40 bg-white/70 dark:bg-charcoal-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-900/20">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              Women Safety <span className="text-purple-600 dark:text-purple-400">Shield</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition shadow-md shadow-purple-700/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-6 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-4 h-4" />
          <span>Real-time Personal Safety System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Your Intelligent, Guardian Angel for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600">Every Journey</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Women Safety Shield unites instant SOS emergency alerts, live GPS location sharing, automated Safe Journey check-ins, encrypted evidence vault, and verified nearby emergency services.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold text-base shadow-xl shadow-purple-700/25 hover:shadow-purple-700/40 hover:-translate-y-0.5 active:translate-y-0 transition transform flex items-center gap-2"
          >
            <span>Activate Your Shield</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href="tel:112"
            className="px-6 py-4 rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 font-bold text-base hover:bg-red-100 transition flex items-center gap-2"
          >
            <PhoneCall className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span>Emergency Police: 112</span>
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instant One-Tap SOS</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Dispatches your live coordinates to trusted contacts and prepares a 1-tap call to 112 with zero delay.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-4">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Safe Journey Mode</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Monitors your commute with scheduled check-in reminders and automatic escalation to contacts if you don't check in.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Location Tracking</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Share real-time encrypted OpenStreetMap location with authorized friends and family using private session keys.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Evidence Vault</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Privately store incident photos, audio memos, and notes with SHA-256 cryptographic verification for integrity.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-4">
              <BotMessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Safety Assistant</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Get immediate, practical guidance on street harassment, cab security, helpline numbers, and legal protections.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified Helpline Directory</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Fast access to 112, 1091 (Women Helpline), 181 (Women in Distress), Sakhi centers, and local police stations.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 Women Safety Shield. Designed with privacy, reliability, and security at core.</p>
        <p className="mt-1">In an acute life-threatening emergency, always dial 112 directly.</p>
      </footer>
    </div>
  );
};
