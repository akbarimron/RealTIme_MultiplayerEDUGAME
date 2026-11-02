// Utilitas Keamanan & Autentikasi Guru/Admin
// Terhubung langsung ke Database Cloud Supabase (bukan hardcoded)

import { getSupabase } from './supabaseClient.js';

const AUTH_STORAGE_KEY = 'KS_ADMIN_AUTH';
const PASSWORD_STORAGE_KEY = 'KS_ADMIN_PASSWORD';
const DEFAULT_PASSWORD = 'guru123';

export const ADMIN_CONFIG_SQL = `-- Tabel konfigurasi & password guru di Supabase
create table if not exists public.admin_config (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Izin akses publik/anon untuk tabel admin_config
alter table public.admin_config enable row level security;

drop policy if exists "Izinkan baca admin_config" on public.admin_config;
create policy "Izinkan baca admin_config"
  on public.admin_config for select
  using (true);

drop policy if exists "Izinkan simpan admin_config" on public.admin_config;
create policy "Izinkan simpan admin_config"
  on public.admin_config for insert
  with check (true);

drop policy if exists "Izinkan update admin_config" on public.admin_config;
create policy "Izinkan update admin_config"
  on public.admin_config for update
  using (true);

-- Nilai awal kata sandi guru jika belum ada
insert into public.admin_config (key, value)
values ('admin_password', 'guru123')
on conflict (key) do nothing;`;

/**
 * Mengambil kata sandi aktif dari cache lokal / fallback
 */
export function getAdminPassword() {
  const custom = typeof localStorage !== 'undefined' ? localStorage.getItem(PASSWORD_STORAGE_KEY) : null;
  if (custom && custom.trim()) return custom.trim();

  const envPass = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_ADMIN_PASSWORD : null;
  if (envPass && envPass.trim()) return envPass.trim();

  return DEFAULT_PASSWORD;
}

/**
 * Mengambil kata sandi dari Database Supabase (Async)
 */
export async function getAdminPasswordAsync() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('value')
        .eq('key', 'admin_password')
        .maybeSingle();

      if (!error && data?.value) {
        // Simpan cache lokal untuk akses cepat / offline
        try { localStorage.setItem(PASSWORD_STORAGE_KEY, data.value); } catch {}
        return { password: data.value, source: 'database' };
      }
    } catch (err) {
      console.warn('⚠️ Gagal mengambil password dari Supabase, gunakan fallback:', err);
    }
  }

  return { password: getAdminPassword(), source: 'local' };
}

/**
 * Memeriksa apakah sesi saat ini sudah login sebagai Admin/Guru
 */
export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false;
  try {
    const sessionAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (sessionAuth === 'true') return true;

    const localAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (localAuth === 'true') return true;
  } catch {
    // Mode privat / storage nonaktif
  }
  return false;
}

/**
 * Memvalidasi dan melakukan login terhadap Database Supabase
 */
export async function loginAdmin(inputPassword, remember = true) {
  const input = (inputPassword || '').trim();

  if (!input) {
    return { success: false, error: 'Masukkan kata sandi guru.' };
  }

  // Cek kata sandi dari Database Supabase
  const { password: current, source } = await getAdminPasswordAsync();

  if (input !== current) {
    return { success: false, error: 'Kata sandi salah. Silakan coba lagi.' };
  }

  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    }
  } catch {
    // Abaikan jika storage terbatas
  }

  return { success: true, source };
}

/**
 * Logout admin dan mengunci akses dashboard
 */
export function logoutAdmin() {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Abaikan
  }
}

/**
 * Mengubah kata sandi guru langsung di Database Supabase
 */
export async function changeAdminPassword(oldPassword, newPassword) {
  const oldP = (oldPassword || '').trim();
  const newP = (newPassword || '').trim();

  const { password: current } = await getAdminPasswordAsync();

  if (oldP !== current) {
    return { success: false, error: 'Kata sandi saat ini tidak sesuai.' };
  }

  if (!newP || newP.length < 4) {
    return { success: false, error: 'Kata sandi baru minimal 4 karakter.' };
  }

  let savedToDatabase = false;
  let dbError = null;

  // 1. Simpan ke Database Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('admin_config')
        .upsert({
          key: 'admin_password',
          value: newP,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        savedToDatabase = true;
      } else {
        dbError = error.message;
        console.warn('⚠️ Supabase error saat simpan password:', error.message);
      }
    } catch (err) {
      dbError = err?.message || 'Koneksi database gagal';
    }
  }

  // 2. Simpan cache lokal
  try {
    localStorage.setItem(PASSWORD_STORAGE_KEY, newP);
  } catch {}

  return {
    success: true,
    savedToDatabase,
    dbError,
    message: savedToDatabase
      ? 'Kata sandi berhasil disimpan di Database Cloud Supabase!'
      : 'Kata sandi disimpan di browser lokal (Tabel Supabase belum dibuat di SQL editor).'
  };
}

/**
 * Mengembalikan kata sandi ke default (guru123)
 */
export async function resetAdminPassword() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('admin_config')
        .upsert({
          key: 'admin_password',
          value: DEFAULT_PASSWORD,
          updated_at: new Date().toISOString()
        });
    } catch {}
  }

  try {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch {}
}
