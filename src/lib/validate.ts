// Shared client-side validators. Backend still re-validates; these give fast, clear feedback.
export const isEmail = (s?: string | null) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s ?? '').trim());
export const isMobile10 = (s?: string | null) => /^[6-9]\d{9}$/.test(String(s ?? '').replace(/\D/g, ''));
export const isPan = (s?: string | null) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(s ?? '').trim().toUpperCase());
export const isPincode = (s?: string | null) => /^[1-9]\d{5}$/.test(String(s ?? '').replace(/\s/g, ''));
export const isGstin = (s?: string | null) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(String(s ?? '').trim().toUpperCase());

// DD-MM-YYYY -> ISO (YYYY-MM-DD) only if it's a real, past, sane date. Else null + a reason.
export function dobToIso(s: string): { iso?: string; error?: string } {
  const m = String(s ?? '').trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return { error: 'Enter date of birth as DD-MM-YYYY.' };
  const dd = +m[1], mm = +m[2], yyyy = +m[3];
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return { error: 'That date is not valid.' };
  const now = new Date();
  if (d.getTime() > now.getTime()) return { error: 'Date of birth cannot be in the future.' };
  const age = (now.getTime() - d.getTime()) / 31557600000;
  if (age > 120) return { error: 'Please check the year of birth.' };
  return { iso: `${m[3]}-${m[2]}-${m[1]}` };
}
