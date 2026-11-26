// Bimayantra mobile API client — the single place that talks HTTP to bimayantra-api.
//
// Ported from the web client (src/api/client.js) with the mobile differences from
// Section 17A:
//   • Sessions are Bearer tokens, not cookies. Every request sends
//     `Authorization: Bearer <accessToken>` and `X-Client: app`; the API returns
//     tokens in the response body (see auth cookies.ts › deliverTokens).
//   • Expired access token (401 TOKEN_EXPIRED) → one silent POST /auth/refresh with
//     { refreshToken } in the body, shared across concurrent requests; then retry once.
//   • Any other 401 on a non-auth path → the session is over: onSessionEnded() fires.
//   • Idempotency-Key on every POST/PUT/PATCH/DELETE.
//   • Step-up OTP (403 STEP_UP_REQUIRED) → the registered handler supplies a token,
//     the request repeats with X-Step-Up-Token.
//   • Envelope: success → { data, meta? }; error → { error: { code, messageId, message, fields?, details?, requestId } }.

import { API_BASE, CLIENT_HEADER } from '../config/env';
import { tokenStore } from '../auth/tokenStore';
import type { Tokens } from './types';

export class ApiError extends Error {
  status: number;
  code: string;
  messageId: string;
  fields: { field: string; message: string }[];
  details: any;
  requestId: string | null;

  constructor({
    status = 0,
    code = 'NETWORK',
    messageId = 'GEN-07',
    message,
    fields = [],
    details = null,
    requestId = null,
  }: Partial<{
    status: number;
    code: string;
    messageId: string;
    message: string;
    fields: { field: string; message: string }[];
    details: any;
    requestId: string | null;
  }> = {}) {
    super(
      message ||
        'Could not reach Bimayantra. Your entries are kept. Check your internet connection and try again.',
    );
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.messageId = messageId;
    this.fields = fields || [];
    this.details = details;
    this.requestId = requestId;
  }

  /** { fieldName: message } for inline form errors. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries((this.fields || []).map((f) => [f.field, f.message]));
  }

  is(...codes: string[]) {
    return codes.includes(this.code);
  }
}

export const newIdempotencyKey = () =>
  (globalThis as any).crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random()
    .toString(36)
    .slice(2)}`;

/* ───────── session + step-up hooks (set by AuthProvider) ───────── */
type SessionListener = (err: ApiError) => void;
const sessionListeners = new Set<SessionListener>();
export function onSessionEnded(fn: SessionListener) {
  sessionListeners.add(fn);
  return () => sessionListeners.delete(fn);
}
const emitSessionEnded = (err: ApiError) => sessionListeners.forEach((fn) => fn(err));

type StepUpHandler = (err: ApiError) => Promise<string | null>;
let stepUpHandler: StepUpHandler | null = null;
export function setStepUpHandler(fn: StepUpHandler | null) {
  stepUpHandler = fn;
}

/* ───────── helpers ───────── */
type Query = Record<string, string | number | boolean | null | undefined | string[]>;

function buildUrl(path: string, query?: Query) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    qs.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

async function parse(res: Response): Promise<any> {
  if (res.status === 204) return { data: null };
  const type = res.headers.get('content-type') || '';
  if (type.includes('application/json')) return res.json();
  return { data: await res.text() };
}

/* ───────── single-flight refresh ───────── */
let refreshing: Promise<'ok' | 'network' | 'fail'> | null = null;

async function runRefresh(): Promise<'ok' | 'network' | 'fail'> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return 'fail';
  let r: Response;
  try {
    r = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client': CLIENT_HEADER,
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return 'network';
  }
  if (r.status >= 500 || r.status === 429) return 'network';
  const j = await r.json().catch(() => ({} as any));
  if (r.ok && j?.data?.tokens) {
    const t = j.data.tokens as Tokens;
    await tokenStore.update(t.accessToken, t.refreshToken);
    return 'ok';
  }
  return 'fail';
}

function refreshSession() {
  refreshing ??= runRefresh()
    .catch(() => 'network' as const)
    .finally(() => {
      setTimeout(() => {
        refreshing = null;
      }, 0);
    });
  return refreshing;
}

const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export interface RequestOpts {
  query?: Query;
  body?: any;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  stepUpToken?: string;
  signal?: AbortSignal;
  _retried?: boolean;
  _stepped?: boolean;
}

export async function request<T = any>(
  method: string,
  path: string,
  opts: RequestOpts = {},
): Promise<{ data: T; meta: any }> {
  const { query, body, headers = {}, idempotencyKey, stepUpToken, signal, _retried = false, _stepped = false } = opts;

  const h: Record<string, string> = {
    Accept: 'application/json',
    'X-Client': CLIENT_HEADER,
    ...headers,
  };

  const access = tokenStore.getAccess();
  if (access && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')) {
    h.Authorization = `Bearer ${access}`;
  }

  let payload: string | undefined;
  if (body !== undefined) {
    h['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  } else if (WRITE.has(method)) {
    h['Content-Type'] = 'application/json';
    payload = '{}';
  }
  if (WRITE.has(method)) h['Idempotency-Key'] = idempotencyKey || newIdempotencyKey();
  if (stepUpToken) h['X-Step-Up-Token'] = stepUpToken;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), { method, headers: h, body: payload, signal });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw e;
    throw new ApiError({}); // GEN-07: network
  }

  if ((res.headers.get('content-type') || '').includes('text/html')) {
    throw new ApiError({
      status: res.status,
      code: 'API_UNREACHABLE',
      message: `The API did not answer at ${API_BASE}. Check EXPO_PUBLIC_API_BASE.`,
    });
  }

  const json = await parse(res).catch(() => ({} as any));
  if (res.ok) return { data: (json?.data ?? null) as T, meta: json?.meta ?? {} };

  const err = new ApiError({
    status: res.status,
    ...(json?.error || { code: `HTTP_${res.status}`, messageId: 'GEN-07', message: res.statusText }),
  });

  // Expired access token → refresh once and repeat (same idempotency key).
  if (res.status === 401 && err.code === 'TOKEN_EXPIRED' && !_retried && !path.startsWith('/auth/refresh')) {
    const outcome = await refreshSession();
    if (outcome === 'ok') {
      return request<T>(method, path, { ...opts, idempotencyKey: h['Idempotency-Key'], _retried: true });
    }
    if (outcome === 'network') throw new ApiError({}); // still signed in, just offline
  }

  // Any other 401 on a protected path → the session is over.
  if (
    res.status === 401 &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/register') &&
    !path.startsWith('/auth/logout')
  ) {
    emitSessionEnded(err);
  }

  // Sensitive action → step-up OTP, then repeat.
  if (res.status === 403 && err.code === 'STEP_UP_REQUIRED' && stepUpHandler && !_stepped) {
    const token = await stepUpHandler(err);
    if (token) {
      return request<T>(method, path, {
        ...opts,
        idempotencyKey: h['Idempotency-Key'],
        stepUpToken: token,
        _stepped: true,
      });
    }
  }

  throw err;
}

export const http = {
  get: <T = any>(path: string, query?: Query, opts?: RequestOpts) =>
    request<T>('GET', path, { ...opts, query }),
  post: <T = any>(path: string, body?: any, opts?: RequestOpts) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T = any>(path: string, body?: any, opts?: RequestOpts) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T = any>(path: string, body?: any, opts?: RequestOpts) =>
    request<T>('PATCH', path, { ...opts, body }),
  del: <T = any>(path: string, body?: any, opts?: RequestOpts) =>
    request<T>('DELETE', path, { ...opts, body }),
};

/** Build a path with encoded params: p`/tasks/${id}/done` */
export const p = (strings: TemplateStringsArray, ...vals: (string | number)[]) =>
  strings.reduce(
    (acc, s, i) => acc + s + (i < vals.length ? encodeURIComponent(String(vals[i])) : ''),
    '',
  );
