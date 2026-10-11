import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Badge } from '../components/common/Badge';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Trash2,
  Edit2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    relationship: 'parent',
    phoneNumber: '',
    email: '',
    preferredNotifyMethod: 'sms',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      if (res?.success) {
        setContacts(res.data.contacts || []);
      }
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      relationship: 'parent',
      phoneNumber: '',
      email: '',
      preferredNotifyMethod: 'sms',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingContact(c);
    setFormData({
      name: c.name,
      relationship: c.relationship,
      phoneNumber: c.phoneNumber,
      email: c.email || '',
      preferredNotifyMethod: c.preferredNotifyMethod || 'sms',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingContact) {
        const res = await api.patch(`/contacts/${editingContact._id}`, formData);
        if (res?.success) {
          toast.success('Contact updated successfully');
          fetchContacts();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/contacts', formData);
        if (res?.success) {
          toast.success('Contact added successfully');
          fetchContacts();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this trusted contact?')) return;
    try {
      const res = await api.delete(`/contacts/${id}`);
      if (res?.success) {
        toast.info('Contact removed');
        setContacts(contacts.filter((c) => c._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Trusted Contacts</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            People who receive your emergency SOS alerts and journey notifications ({contacts.length}/10 configured).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={contacts.length >= 10}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Trusted Contact</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No trusted contacts yet"
          description="Add friends, family, or guardians so they can be immediately alerted in an emergency."
          action={
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Add First Contact
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((c) => (
            <div
              key={c._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{c.name}</h3>
                    <Badge variant="primary" className="mt-1 capitalize">
                      {c.relationship}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>{c.phoneNumber}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      <span>{c.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Alert Channel: <strong>{c.preferredNotifyMethod.toUpperCase()}</strong></span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingContact ? 'Edit Trusted Contact' : 'Add New Trusted Contact'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mom, Brother, Priya"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Relationship
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="spouse">Spouse / Partner</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Alert
              </label>
              <select
                value={formData.preferredNotifyMethod}
                onChange={(e) => setFormData({ ...formData, preferredNotifyMethod: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="call">Voice Call</option>
                <option value="app">App Push</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="contact@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingContact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
