// Supabase Realtime Client & Broadcast Manager
// Optimized for Serverless Vercel Deployments & Multi-device Sync

import { createClient } from '@supabase/supabase-js';

/**
 * Pembersih URL Supabase yang tangguh.
 * Menangani kasus copas dari dashboard Supabase seperti:
 *  - "https://ugyldhlabaiwvhjucrph.supabase.co/rest/v1/ API URL"
 *  - "https://ugyldhlabaiwvhjucrph.supabase.co/rest/v1"
 *  - "https://ugyldhlabaiwvhjucrph.supabase.co/"
 *  - "http://127.0.0.1:54321"
 */
export function sanitizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = String(rawUrl).trim();

  // Ekstrak protokol + host + optional port (misal: https://xxx.supabase.co atau http://127.0.0.1:54321)
  const match = trimmed.match(/https?:\/\/[a-z0-9.-]+(?::[0-9]+)?/i);
  if (match) {
    return match[0].replace(/\/+$/, '');
  }

  // Fallback pembersihan manual jika format tidak lazim
  return trimmed
    .replace(/\s+API\s+URL.*$/i, '')
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
}

/**
 * Pembersih Anon / Public Key Supabase.
 * Menghilangkan kata label seperti "anon public", spasi berlebih, atau tanda petik.
 */
export function sanitizeSupabaseKey(rawKey) {
  if (!rawKey) return '';
  const trimmed = String(rawKey).trim();

  // Deteksi token format JWT (header.payload.signature)
  const jwtMatch = trimmed.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
  if (jwtMatch) {
    return jwtMatch[0];
  }

  // Bersihkan prefiks label dan tanda petik
  return trimmed
    .replace(/^(anon\s+public|anon|public|service_role)[:\s]*/i, '')
    .replace(/['"]+/g, '')
    .trim();
}

// Dapatkan konfigurasi dari LocalStorage atau Environment variables (.env / Vercel)
export function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem('KS_SUPABASE_URL') || '';
    localKey = localStorage.getItem('KS_SUPABASE_KEY') || '';
  } catch {
    // Abaikan jika localStorage tidak tersedia
  }

  // Gunakan localUrl jika disimpan manual lewat modal, atau fallback ke .env
  const rawUrl = localUrl || envUrl || '';
  const rawKey = localKey || envKey || '';

  const url = sanitizeSupabaseUrl(rawUrl);
  const key = sanitizeSupabaseKey(rawKey);

  // Self-healing: jika di localStorage tersimpan URL kotor (/rest/v1/ API URL), langsung perbaiki otomatis!
  if (localUrl && url && localUrl !== url) {
    try { localStorage.setItem('KS_SUPABASE_URL', url); } catch {}
  }
  if (localKey && key && localKey !== key) {
    try { localStorage.setItem('KS_SUPABASE_KEY', key); } catch {}
  }

  return { url, key, isConfigured: Boolean(url && key) };
}

export function saveSupabaseConfig(url, key) {
  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = sanitizeSupabaseKey(key);
  try {
    if (cleanUrl) localStorage.setItem('KS_SUPABASE_URL', cleanUrl);
    if (cleanKey) localStorage.setItem('KS_SUPABASE_KEY', cleanKey);
  } catch (err) {
    console.error('Gagal menyimpan ke localStorage:', err);
  }
}

export function clearSupabaseConfig() {
  try {
    localStorage.removeItem('KS_SUPABASE_URL');
    localStorage.removeItem('KS_SUPABASE_KEY');
  } catch {}
}

let supabaseInstance = null;
let currentConfigSig = '';

export function getSupabase() {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    supabaseInstance = null;
    return null;
  }

  const sig = `${url}:::${key}`;
  if (!supabaseInstance || currentConfigSig !== sig) {
    try {
      supabaseInstance = createClient(url, key, {
        realtime: {
          params: {
            eventsPerSecond: 20
          }
        }
      });
      currentConfigSig = sig;
      console.log('⚡ [Supabase Cloud]: Client initialized successfully with:', url);
    } catch (err) {
      console.error('❌ Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}
