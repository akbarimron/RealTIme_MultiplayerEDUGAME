import React, { useState } from 'react';
import Modal, { CloseButton } from './ui/Modal';
import { changeAdminPassword, resetAdminPassword, ADMIN_CONFIG_SQL } from '../utils/adminAuth';

export default function AdminPasswordChangeModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setLoading(true);
    const res = await changeAdminPassword(oldPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess(res.message || 'Kata sandi guru berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess('');
        onClose?.();
      }, 1800);
    } else {
      setError(res.error || 'Gagal mengubah kata sandi.');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Kembalikan kata sandi guru ke default ("guru123")?')) {
      setLoading(true);
      await resetAdminPassword();
      setLoading(false);
      setSuccess('Kata sandi berhasil dikembalikan ke default ("guru123").');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess('');
        onClose?.();
      }, 1500);
    }
  };

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(ADMIN_CONFIG_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      setCopiedSql(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} label="Pengaturan Keamanan Guru" size="md" sheetOnMobile={false}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">Kata Sandi Database</h2>
            <p className="text-[14px] text-ink-2">
              Tersimpan di Database Supabase agar terpusat dan aman.
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-extrabold">
            Kata Sandi Saat Ini
            <input
              type="password"
              required
              placeholder="Masukkan sandi saat ini"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="h-12 rounded-2xl bg-paper px-4 font-mono text-sm font-medium outline-none ring-2 ring-transparent focus:ring-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-extrabold">
            Kata Sandi Baru
            <input
              type="password"
              required
              placeholder="Minimal 4 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 rounded-2xl bg-paper px-4 font-mono text-sm font-medium outline-none ring-2 ring-transparent focus:ring-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-extrabold">
            Konfirmasi Kata Sandi Baru
            <input
              type="password"
              required
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 rounded-2xl bg-paper px-4 font-mono text-sm font-medium outline-none ring-2 ring-transparent focus:ring-ink"
            />
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-coral/15 px-3.5 py-2.5 text-xs font-bold text-[#D32F2F]">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-mint/20 px-3.5 py-2.5 text-xs font-bold text-mint-dark">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-ink flex-1 min-h-[50px] text-base font-extrabold disabled:opacity-50"
            >
              {loading ? 'Menyimpan ke Database...' : 'Simpan ke Database'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleReset}
              className="btn btn-white min-h-[50px] px-4 text-xs font-bold text-coral ring-1 ring-coral/20 hover:bg-coral/10"
              title="Reset ke default guru123"
            >
              Reset Default
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between gap-3 rounded-[20px] bg-paper p-3.5 text-xs">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink">Skema SQL Database Supabase</p>
            <p className="text-ink-2">Jalankan sekali di Supabase SQL Editor untuk membuat tabel `admin_config`.</p>
          </div>
          <button
            type="button"
            onClick={copySql}
            className="btn btn-white min-h-8 shrink-0 px-3 text-xs font-bold ring-1 ring-[#D6D2EA]"
          >
            {copiedSql ? 'Tersalin!' : 'Salin SQL'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
