// Mirrors backend normalizeMobile (FLD-01): strip +91/91/0, must be 10 digits
// starting 6-9. Stored/sent as "+91XXXXXXXXXX". The backend re-validates anyway.
export function normalizeMobile(raw: string): string | null {
  let v = raw.trim().replace(/[\s\-()]/g, '');
  if (v.startsWith('+91')) v = v.slice(3);
  else if (v.length === 12 && v.startsWith('91')) v = v.slice(2);
  else if (v.length === 11 && v.startsWith('0')) v = v.slice(1);
  return /^[6-9]\d{9}$/.test(v) ? `+91${v}` : null;
}

export const isValidMobile = (raw: string) => normalizeMobile(raw) !== null;
