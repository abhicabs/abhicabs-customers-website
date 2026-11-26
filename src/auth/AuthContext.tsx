import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api } from '../api/endpoints';
import { onSessionEnded } from '../api/client';
import { tokenStore } from './tokenStore';
import type { Me, SignInResult } from '../api/types';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: Status;
  user: Me | null;
  /** Called from the OTP screen after a successful verify. */
  completeSignIn: (result: SignInResult) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<Me | null>(null);
  const signingOut = useRef(false);

  const signOut = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    try {
      // Best-effort server logout; the client clears regardless.
      await api.auth.logout().catch(() => undefined);
    } finally {
      await tokenStore.clear();
      setUser(null);
      setStatus('signedOut');
      signingOut.current = false;
    }
  }, []);

  const completeSignIn = useCallback(async (result: SignInResult) => {
    await tokenStore.save(result.tokens);
    setUser(result.user);
    setStatus('signedIn');
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.auth.me();
    setUser(data);
  }, []);

  // Bootstrap: if a session is stored, confirm it with /auth/me.
  useEffect(() => {
    (async () => {
      await tokenStore.hydrate();
      if (!tokenStore.hasSession()) {
        setStatus('signedOut');
        return;
      }
      try {
        const { data } = await api.auth.me();
        setUser(data);
        setStatus('signedIn');
      } catch {
        await tokenStore.clear();
        setStatus('signedOut');
      }
    })();
  }, []);

  // Any 401 the client can't recover from → drop to signed-out.
  useEffect(() => {
    const off = onSessionEnded(() => {
      void signOut();
    });
    return () => {
      off();
    };
  }, [signOut]);

  const value = useMemo<AuthState>(
    () => ({ status, user, completeSignIn, signOut, refreshUser }),
    [status, user, completeSignIn, signOut, refreshUser],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
