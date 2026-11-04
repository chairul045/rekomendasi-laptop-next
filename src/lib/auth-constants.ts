// src/lib/auth-constants.ts - Centralized Admin & Role Authorization Rules

export const SUPER_ADMIN_EMAIL = 'chairulanwarr003@gmail.com';

/**
 * Memeriksa apakah suatu email merupakan Super Administrator resmi.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
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

  // Cegah role 'admin' dipilih oleh akun selain SUPER_ADMIN_EMAIL
  if (!normalized || normalized === 'admin') {
    return 'mahasiswa';
  }

  return normalized;
}
