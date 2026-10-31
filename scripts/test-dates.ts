import { formatTanggal, formatTanggalWaktu } from '../src/lib/date-utils';

console.log('1. ISO string:', formatTanggal('2026-10-31T12:00:00Z'));
console.log('2. DD/MM/YYYY:', formatTanggal('31/10/2026'));
console.log('3. Date object:', formatTanggal(new Date('2026-10-31T12:34:56Z')));
console.log('4. formatTanggalWaktu:', formatTanggalWaktu('2026-10-31T12:30:00Z'));
console.log('5. Invalid:', formatTanggal('bukan-tanggal'));
process.exit(0);
