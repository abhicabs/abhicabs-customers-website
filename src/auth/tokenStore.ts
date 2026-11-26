import * as SecureStore from 'expo-secure-store';
import type { Tokens } from '../api/types';

// Tokens live in the device keychain / keystore (expo-secure-store), never in
// AsyncStorage. An in-memory copy is kept so the hot request path is sync.

const ACCESS_KEY = 'bm_access_token';
const REFRESH_KEY = 'bm_refresh_token';

let cache: { accessToken: string | null; refreshToken: string | null } = {
  accessToken: null,
  refreshToken: null,
};

export const tokenStore = {
  /** Load from secure storage into memory on app start. */
  async hydrate() {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY),
      SecureStore.getItemAsync(REFRESH_KEY),
    ]);
    cache = { accessToken, refreshToken };
    return cache;
  },

  getAccess() {
    return cache.accessToken;
  },
  getRefresh() {
    return cache.refreshToken;
  },
  hasSession() {
    return Boolean(cache.refreshToken);
  },

  async save(t: Tokens) {
    cache = { accessToken: t.accessToken, refreshToken: t.refreshToken };
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, t.accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, t.refreshToken),
    ]);
  },

  /** Rotate just the pair after a refresh. */
  async update(accessToken: string, refreshToken: string) {
    cache = { accessToken, refreshToken };
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
    ]);
  },

  async clear() {
    cache = { accessToken: null, refreshToken: null };
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};
