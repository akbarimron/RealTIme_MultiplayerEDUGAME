import React, { useState } from 'react';
import Modal, { CloseButton } from './ui/Modal';
import { getSupabaseConfig, saveSupabaseConfig } from '../utils/supabaseClient';

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

  const save = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    setSaved(true);
    setTimeout(() => window.location.reload(), 700);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} label="Koneksi realtime" size="lg" sheetOnMobile={false}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">Koneksi realtime</h2>
            <p className="text-[15px] text-ink-2">
              {current.isConfigured
                ? 'Supabase aktif. HP siswa bisa ikut dari jaringan mana saja.'
                : 'Sekarang mode lokal: tab di laptop ini saling sinkron, dan HP di Wi-Fi yang sama ikut jika server Node berjalan (npm run server). Isi Supabase agar bisa dipakai online.'}
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <form onSubmit={save} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-extrabold">
            Project URL Supabase
            <input
              type="url"
              required
              placeholder="https://id-proyek.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 rounded-2xl bg-paper px-4 font-mono text-sm font-medium outline-none ring-2 ring-transparent focus:ring-ink"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-extrabold">
            Anon public key
            <input
              type="text"
              required
              placeholder="Tempel anon key dari Project Settings > API"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="h-12 rounded-2xl bg-paper px-4 font-mono text-sm font-medium outline-none ring-2 ring-transparent focus:ring-ink"
            />
          </label>
          <button type="submit" className="btn btn-ink min-h-[52px] text-base" disabled={saved}>
            {saved ? 'Tersimpan, memuat ulang...' : 'Simpan dan sambungkan'}
          </button>
        </form>

        <div className="rounded-[20px] bg-paper p-4 text-sm">
          <p className="font-extrabold">Untuk hosting di Vercel</p>
          <p className="mt-1 text-ink-2">Tambahkan dua variabel di Settings, Environment Variables:</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-night p-3 font-mono text-[13px] text-mint">{`VITE_SUPABASE_URL=${url || 'https://id-proyek.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${key ? `${key.slice(0, 16)}...` : 'anon-key-anda'}`}</pre>
          <a
            href="https://vercel.com/docs/projects/environment-variables"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block font-bold underline underline-offset-2"
          >
            Panduan environment variable Vercel
          </a>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[20px] bg-paper p-4 text-sm">
          <span className="text-ink-2">Skema tabel riwayat (opsional, tidak wajib untuk bermain)</span>
          <button type="button" onClick={copy} className="btn btn-white min-h-10 ring-1 ring-[#D6D2EA]">
            {copied ? 'Tersalin' : 'Salin SQL'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
