// src/lib/date-utils.ts - Helper pemformatan tanggal konsisten (id-ID & zona WIB)

/**
 * Memformat tanggal ke dalam format bahasa Indonesia (contoh: "31 Oktober 2026")
 * Mendukung ISO string, Date object, Unix timestamp, dan format lama seperti "DD/MM/YYYY".
 * Selalu menggunakan zona waktu WIB (Asia/Jakarta).
 *
 * @param dateInput Nilai tanggal yang akan diformat
 * @param options Opsi format Intl (opsional)
 * @returns String tanggal terformat atau fallback jika tidak valid
 */
export function formatTanggal(
  dateInput: string | Date | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return '-';

  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    const rawStr = String(dateInput).trim();
    if (!rawStr) return '-';

    // Cek apakah format lama "DD/MM/YYYY" atau "DD-MM-YYYY" (contoh: "31/10/2026")
    const dmyRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(.*)$/;
    const dmyMatch = rawStr.match(dmyRegex);

    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed
      const year = parseInt(dmyMatch[3], 10);
      date = new Date(Date.UTC(year, month, day, 12, 0, 0));
    } else {
      date = new Date(rawStr);
    }
  }

  // Jika parsing gagal / Invalid Date
  if (isNaN(date.getTime())) {
    return 'Data tanggal tidak valid';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
    ...options,
  };

  try {
    return new Intl.DateTimeFormat('id-ID', defaultOptions).format(date);
  } catch {
    // Fallback jika timezone Asia/Jakarta tidak didukung di lingkungan tertentu
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}

/**
 * Format tanggal dan waktu lengkap (contoh: "31 Oktober 2026, 19:30 WIB")
 */
export function formatTanggalWaktu(
  dateInput: string | Date | number | null | undefined
): string {
  if (!dateInput) return '-';
  const tgl = formatTanggal(dateInput);
  if (tgl === '-' || tgl === 'Data tanggal tidak valid') return tgl;

  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    const dmyMatch = String(dateInput).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      date = new Date(Date.UTC(year, month, day));
    } else {
      date = new Date(dateInput);
    }
  }

  if (isNaN(date.getTime())) return 'Data tanggal tidak valid';

  try {
    const timeStr = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false,
    }).format(date);
    return `${tgl}, ${timeStr} WIB`;
  } catch {
    return tgl;
  }
}
