// Supabase Realtime Client & Broadcast Manager
// Optimized for Serverless Vercel Deployments

import { createClient } from '@supabase/supabase-js';

export function sanitizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
}

// Get config from Environment variables or LocalStorage
export function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem('KS_SUPABASE_URL');
  const localKey = localStorage.getItem('KS_SUPABASE_KEY');

  const url = sanitizeSupabaseUrl(envUrl || localUrl || '');
  const key = (envKey || localKey || '').trim();

  return { url, key, isConfigured: Boolean(url && key) };
}

export function saveSupabaseConfig(url, key) {
  if (url) localStorage.setItem('KS_SUPABASE_URL', sanitizeSupabaseUrl(url));
  if (key) localStorage.setItem('KS_SUPABASE_KEY', key.trim());
}

let supabaseInstance = null;

export function getSupabase() {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        realtime: {
          params: {
            eventsPerSecond: 20
          }
        }
      });
      console.log('⚡ [Supabase Cloud]: Client initialized successfully with:', url);
    } catch (err) {
      console.error('❌ Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}
