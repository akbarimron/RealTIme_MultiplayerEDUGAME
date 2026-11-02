import React, { useState } from 'react';
import Modal, { CloseButton } from './ui/Modal';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, sanitizeSupabaseUrl, sanitizeSupabaseKey } from '../utils/supabaseClient';

const SQL = `-- Opsional: tabel riwayat sesi
create table if not exists public.game_sessions (
  id text primary key,
  is_playing boolean default false,
  teams_data jsonb not null,
  recent_event jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter publication supabase_realtime add table public.game_sessions;`;

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const current = getSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = sanitizeSupabaseKey(key);
  const isUrlDirty = url && cleanUrl !== url.trim();

  const save = (e) => {
    e.preventDefault();
    saveSupabaseConfig(cleanUrl, cleanKey);
    setSaved(true);
    setTimeout(() => window.location.reload(), 600);
  };

  const handleReset = () => {
    if (window.confirm('Hapus pengaturan Supabase dan kembali ke mode lokal?')) {
      clearSupabaseConfig();
      setUrl('');
      setKey('');
      setTimeout(() => window.location.reload(), 400);
    }
  };

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const copyEnvText = async () => {
    const envString = `VITE_SUPABASE_URL=${cleanUrl || 'https://id-proyek.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${cleanKey || 'anon-key-anda'}`;
    try {
      await navigator.clipboard.writeText(envString);
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 1800);
    } catch {
      setCopiedEnv(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} label="Koneksi realtime" size="lg" sheetOnMobile={false}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold">Koneksi Realtime</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  current.isConfigured
                    ? 'bg-mint/20 text-mint'
                    : 'bg-paper text-ink-2'
                }`}
              >
                {current.isConfigured ? 'Supabase Aktif' : 'Mode Lokal'}
              </span>
            </div>
            <p className="mt-1 text-[15px] text-ink-2">
              {current.isConfigured
                ? 'Supabase aktif. Siswa dapat bermain secara online dari jaringan internet mana saja.'
                : 'Mode lokal aktif: antar tab di laptop ini saling sinkron. Hubungkan ke Supabase gratis agar siswa bisa bermain lewat HP di rumah / kelas.'}
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={save} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-extrabold">
            <span className="flex items-center justify-between">
              <span>Project URL Supabase</span>
              <span className="text-xs font-normal text-ink-2">Format: https://id-proyek.supabase.co</span>
            </span>
            <input
              type="text"
              required
              placeholder="https://ugyldhlabaiwvhjucrph.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => {
                if (cleanUrl) setUrl(cleanUrl);
              }}
              className="h-12 rounded-2xl bg-paper px-4 font-mono text-sm font-medium outline-none ring-2 ring-transparent focus:ring-ink"
            />
            {isUrlDirty && (
              <p className="text-xs font-semibold text-mint">
                ✨ Otomatis dirapikan: <span className="font-mono">{cleanUrl}</span>
              </p>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-extrabold">
            <span className="flex items-center justify-between">
              <span>Anon Public Key</span>
              <span className="text-xs font-normal text-ink-2">Project Settings → API → anon public</span>
            </span>
            <input
              type="text"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onBlur={() => {
                if (cleanKey) setKey(cleanKey);
              }}
              className="h-12 rounded-2xl bg-paper px-4 font-mono text-sm font-medium outline-none ring-2 ring-transparent focus:ring-ink"
            />
          </label>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn btn-ink flex-1 min-h-[50px] text-base" disabled={saved}>
              {saved ? 'Tersimpan, memuat ulang...' : 'Simpan dan Sambungkan'}
            </button>
            {current.isConfigured && (
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-white min-h-[50px] px-4 text-sm font-bold text-coral ring-1 ring-coral/20 hover:bg-coral/10"
              >
                Reset ke Lokal
              </button>
            )}
          </div>
        </form>

        <div className="rounded-[20px] bg-paper p-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-extrabold">Untuk Hosting di Vercel</p>
            <button
              type="button"
              onClick={copyEnvText}
              className="btn btn-white min-h-8 px-3 text-xs font-bold ring-1 ring-[#D6D2EA]"
            >
              {copiedEnv ? 'Tersalin!' : 'Salin Variabel .env'}
            </button>
          </div>
          <p className="mt-1 text-ink-2">Tambahkan dua variabel ini di Vercel: <b>Settings → Environment Variables</b>:</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-night p-3 font-mono text-[13px] text-mint">{`VITE_SUPABASE_URL=${cleanUrl || 'https://id-proyek.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${cleanKey ? `${cleanKey.slice(0, 16)}...` : 'anon-key-anda'}`}</pre>
          <a
            href="https://vercel.com/docs/projects/environment-variables"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-bold underline underline-offset-2"
          >
            Panduan Environment Variable Vercel ↗
          </a>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[20px] bg-paper p-4 text-sm">
          <span className="text-ink-2">Skema tabel riwayat (opsional, tidak wajib untuk bermain)</span>
          <button type="button" onClick={copySql} className="btn btn-white min-h-10 ring-1 ring-[#D6D2EA]">
            {copied ? 'Tersalin' : 'Salin SQL'}
          </button>
        </div>
      </div>
    </Modal>
  );
}