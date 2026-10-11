import React from 'react';
import {
  ShieldCheck,
  EyeOff,
  Database,
  Lock,
  Trash2,
  Clock,
  UserCheck,
} from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          <span>Privacy & Data Protection Dashboard</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete transparency on how Women Safety Shield handles, stores, and protects your personal safety information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What We Collect */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-3">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">What Information We Collect</h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li>• <strong>Account Details:</strong> Full name, verified mobile number, email, and password hash.</li>
            <li>• <strong>Trusted Contacts:</strong> Names, relationships, and telephone numbers configured by you.</li>
            <li>• <strong>Location Coordinates:</strong> Captured strictly during an active SOS incident or active Safe Journey.</li>
            <li>• <strong>Evidence Files:</strong> Encrypted files uploaded deliberately into your Evidence Vault.</li>
          </ul>
        </div>

        {/* Why We Collect It */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-3">
            <UserCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Why It Is Collected</h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li>• To dispatch your location to your designated circle during an acute emergency.</li>
            <li>• To calculate distances to verified nearby police stations and hospitals.</li>
            <li>• To monitor safe journeys and trigger check-in prompts.</li>
            <li>• We <strong>never</strong> monetize, advertise against, or sell personal safety data.</li>
          </ul>
        </div>

        {/* How Long Retained */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Data Retention Policy</h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li>• Live Location sessions expire automatically after the configured duration (max 12h).</li>
            <li>• Movement trails are throttled and capped to avoid excessive historical tracking.</li>
            <li>• Cached safe places from OpenStreetMap auto-expire and refresh weekly.</li>
            <li>• Evidence items are preserved exclusively until you elect to delete them.</li>
          </ul>
        </div>

        {/* Deletion & Control */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-3">
            <Trash2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Control & Deletion Rights</h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li>• You can delete individual evidence files at any time with complete disk erasure.</li>
            <li>• You can clear your trusted contacts list instantly.</li>
            <li>• You can trigger permanent Account Deletion under Settings, which cascades and erases every database document and stored file immediately.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
