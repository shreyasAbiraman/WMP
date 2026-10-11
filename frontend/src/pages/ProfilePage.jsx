import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Edit2,
  Save,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/users/me', { fullName, phoneNumber });
      if (res?.success && res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully');
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          <span>User Profile</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal identity and verified contact information.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-purple-900/20">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.fullName}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <Badge variant="success" className="mt-1">
                Account Active
              </Badge>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 rounded-xl hover:bg-purple-100 transition flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400">Phone Number</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                <span>{user?.phoneNumber}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400">Registered Email</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <span>{user?.email}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 sm:col-span-2">
              <span className="text-slate-400">Account Created</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
