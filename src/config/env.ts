// Central runtime config. Point API_BASE at your bimayantra-api.
//
// Set it via an Expo public env var (EXPO_PUBLIC_API_BASE) in app.json / .env,
// so dev, staging and prod builds differ by config only — never code.
//
//   .env            -> EXPO_PUBLIC_API_BASE=https://api.bimayantra.com/v1
//   local emulator  -> Android: http://10.0.2.2:4000/v1   iOS sim: http://localhost:4000/v1
//
// The API mounts everything under /v1 (see backend env.API_PREFIX), so include /v1 here.

const fallback = 'http://localhost:4000/v1';

export const API_BASE = (
  process.env.EXPO_PUBLIC_API_BASE?.trim() || fallback
).replace(/\/$/, '');

// Sent on every request so the backend returns tokens in the body (Section 17A)
// instead of setting HttpOnly cookies the way it does for the web console.
export const CLIENT_HEADER = 'app';

// Web app URL — used for actions that are web-only (billing, wallet recharge, invoices).
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL?.trim() || API_BASE.replace(/\/v1\/?$/, '').replace(/\/\/api\./, '//app.')).replace(/\/$/, '');
