import React, { useState, useRef, useEffect } from 'react';
import Modal, { CloseButton } from './ui/Modal';
import { loginAdmin } from '../utils/adminAuth';

export default function AdminLoginModal({ isOpen, onClose, onSuccess, onSwitchToStudent }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Masukkan kata sandi guru.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await loginAdmin(password, remember);
    setLoading(false);

    if (res.success) {
      setPassword('');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      setError(res.error || 'Kata sandi salah.');
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} label="Masuk Layar Guru" size="md" sheetOnMobile={false}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper text-2xl">
              🔒
            </div>
            <div>
              <h2 className="text-2xl font-extrabold leading-tight">Layar Guru & Proyektor</h2>
              <p className="text-xs font-semibold text-ink-2">Akses Terkunci Khusus Pengajar</p>
            </div>
          </div>
          {onClose && <CloseButton onClick={onClose} />}
        </div>

        <p className="text-[14px] leading-relaxed text-ink-2">
          Masukkan kata sandi guru untuk membuka dashboard kontrol tebing, mengatur waktu, dan memproyeksikan layar ke kelas.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-extrabold">
            Kata Sandi Guru
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="h-12 w-full rounded-2xl bg-paper px-4 pr-12 font-mono text-sm font-medium outline-none ring-2 ring-transparent focus:ring-ink"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1.5 text-xs font-bold text-ink-2 hover:text-ink select-none"
                tabIndex={-1}
              >
                {showPassword ? 'Tutup' : 'Lihat'}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between text-xs font-semibold text-ink-2">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-[#0E0F24]"
              />
              <span>Ingat saya di perangkat ini</span>
            </label>
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl bg-coral/15 px-3.5 py-2.5 text-xs font-bold text-[#D32F2F]">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-ink min-h-[50px] text-base font-extrabold"
          >
            {loading ? 'Memeriksa...' : 'Buka Layar Guru'}
          </button>
        </form>

        {onSwitchToStudent && (
          <div className="border-t border-[#F0EDF9] pt-3 text-center">
            <button
              type="button"
              onClick={onSwitchToStudent}
              className="text-xs font-bold text-ink-2 underline underline-offset-2 hover:text-ink"
            >
              Saya siswa, ingin ikut bermain →
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
