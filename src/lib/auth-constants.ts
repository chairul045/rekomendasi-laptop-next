// src/lib/auth-constants.ts - Centralized Admin & Role Authorization Rules

export const DEFAULT_ADMIN_EMAIL = 'chairulanwarr003@gmail.com';

/**
 * Mengambil daftar email admin resmi dari environment variable (ADMIN_WHITELIST_EMAILS atau ADMIN_EMAILS).
 */
export function getAdminWhitelistEmails(): string[] {
  const envEmails = process.env.ADMIN_WHITELIST_EMAILS || process.env.ADMIN_EMAILS;
  if (envEmails) {
    const list = envEmails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);
    if (list.length > 0) return list;
  }
  return [DEFAULT_ADMIN_EMAIL.toLowerCase()];
}

/**
 * Backward compatibility alias untuk super admin email utama
 */
export const SUPER_ADMIN_EMAIL = DEFAULT_ADMIN_EMAIL;

/**
 * Memeriksa apakah suatu email merupakan Super Administrator resmi.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const whitelist = getAdminWhitelistEmails();
  return whitelist.includes(normalized);
}

/**
 * Membersihkan role pengguna agar hanya email admin resmi yang berhak mendapatkan role 'admin'.
 * Pengguna umum (pelajar, mahasiswa, pekerja, dosen, dll) akan selalu dipastikan bukan 'admin'.
 */
export function sanitizeUserRole(email?: string | null, requestedRole?: string | null): string {
  const isSuperAdmin = isSuperAdminEmail(email);

  if (isSuperAdmin) {
    return 'admin';
  }

  const normalized = (requestedRole ?? '').trim().toLowerCase();

  // Cegah role 'admin' dipilih oleh akun selain email admin resmi
  if (!normalized || normalized === 'admin') {
    return 'mahasiswa';
  }

  return normalized;
}
