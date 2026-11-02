// Utilitas Keamanan & Autentikasi Guru/Admin
// Mencegah siswa mengakses dashboard host/guru

const AUTH_STORAGE_KEY = 'KS_ADMIN_AUTH';
const PASSWORD_STORAGE_KEY = 'KS_ADMIN_PASSWORD';
const DEFAULT_PASSWORD = 'guru123';

/**
 * Mengambil kata sandi aktif (dari localStorage, .env, atau default 'guru123')
 */
export function getAdminPassword() {
  const custom = typeof localStorage !== 'undefined' ? localStorage.getItem(PASSWORD_STORAGE_KEY) : null;
  if (custom && custom.trim()) return custom.trim();

  const envPass = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_ADMIN_PASSWORD : null;
  if (envPass && envPass.trim()) return envPass.trim();

  return DEFAULT_PASSWORD;
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
 * Memvalidasi dan melakukan login
 */
export function loginAdmin(inputPassword, remember = true) {
  const current = getAdminPassword();
  const input = (inputPassword || '').trim();

  if (!input) {
    return { success: false, error: 'Masukkan kata sandi guru.' };
  }

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

  return { success: true };
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
 * Mengubah kata sandi guru
 */
export function changeAdminPassword(oldPassword, newPassword) {
  const current = getAdminPassword();
  const oldP = (oldPassword || '').trim();
  const newP = (newPassword || '').trim();

  if (oldP !== current) {
    return { success: false, error: 'Kata sandi lama tidak sesuai.' };
  }

  if (!newP || newP.length < 4) {
    return { success: false, error: 'Kata sandi baru minimal 4 karakter.' };
  }

  try {
    localStorage.setItem(PASSWORD_STORAGE_KEY, newP);
  } catch (err) {
    return { success: false, error: 'Gagal menyimpan ke penyimpanan lokal.' };
  }

  return { success: true };
}

/**
 * Mengembalikan kata sandi ke default (guru123)
 */
export function resetAdminPassword() {
  try {
    localStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch {}
}
