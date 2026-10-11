import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import {
  Lock,
  Upload,
  Download,
  Trash2,
  FileCheck2,
  Image,
  Mic,
  Video,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const EvidenceVaultPage = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    try {
      const res = await api.get('/evidence');
      if (res?.success) {
        setEvidenceList(res.data.evidence || []);
      }
    } catch (err) {
      toast.error('Failed to load evidence vault');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title || file.name);
    formData.append('description', description);
    formData.append('file', file);

    try {
      const res = await api.post('/evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res?.success) {
        toast.success('Evidence file uploaded with SHA-256 verification!');
        setUploadModalOpen(false);
        setTitle('');
        setDescription('');
        setFile(null);
        fetchEvidence();
      }
    } catch (err) {
      toast.error(err.message || 'Evidence upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (item) => {
    try {
      toast.loading(`Downloading ${item.originalFileName}...`, { id: 'dl' });
      const res = await api.get(`/evidence/${item._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download complete', { id: 'dl' });
    } catch (err) {
      toast.error('Download failed', { id: 'dl' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this evidence file and its cryptographic integrity record?')) return;
    try {
      const res = await api.delete(`/evidence/${id}`);
      if (res?.success) {
        toast.info('Evidence record deleted');
        setEvidenceList(evidenceList.filter((e) => e._id !== id));
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'image':
        return Image;
      case 'audio':
        return Mic;
      case 'video':
        return Video;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Emergency Evidence Vault</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Private, access-controlled repository for incident photos, voice memos, and notes with SHA-256 verification.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Evidence</span>
        </button>
      </div>

      {/* Legal & Cryptographic Integrity Disclosure Notice */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
        <FileCheck2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">Cryptographic Integrity Notice</p>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400">
            Every uploaded file is hashed using SHA-256 on the server to prevent silent tampering or modification. A cryptographic hash validates that the file has not been altered since upload, but does not independently establish legal chain-of-custody.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : evidenceList.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="Evidence Vault is empty"
          description="You can securely archive photos of suspicious vehicles, audio notes, or incident documentation here."
          action={
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Upload First Item
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {evidenceList.map((item) => {
            const Icon = getCategoryIcon(item.fileCategory);
            return (
              <div
                key={item._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                      <Badge variant="primary" className="capitalize text-[10px]">
                        {item.fileCategory}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400 font-mono">
                      SHA-256: {item.sha256Hash?.substring(0, 24)}...
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Uploaded {new Date(item.createdAt).toLocaleString()} • {(item.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(item)}
                    className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Private Incident Evidence"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Evidence Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cab License Plate Photo, Threat Audio Memo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Circumstances (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add contextual details, exact time, location or notes."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select File (Photo, Audio, Video, PDF - Max 25MB)
            </label>
            <input
              type="file"
              required
              accept="image/*,audio/*,video/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {uploading ? 'Verifying & Saving...' : 'Securely Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
