import { memoryStorage } from '@/utils/memory-storage';

const TOKEN_KEY = 'ws_token';
const LEGACY_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'ws_refresh_token';
const TOKEN_EXPIRES_KEY = 'token_expires_time';
const USER_ID_KEY = 'user_id';

const tokenListeners = new Set();

export function onTokenChange(listener) {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

class TokenManager {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }

  emitTokenChange() {
    const token = this.getToken();
    tokenListeners.forEach((listener) => {
      try {
        listener(token);
      } catch (error) {
        console.error('[token] listener failed:', error);
      }
    });
  }

  setToken(token, refreshToken = null, expiresIn = null) {
    this.token = token;
    this.refreshToken = refreshToken;

    if (expiresIn) {
      this.expiresAt = Date.now() + expiresIn * 1000;
      memoryStorage.setItem(TOKEN_EXPIRES_KEY, String(this.expiresAt));
    }

    if (token) {
      memoryStorage.setItem(TOKEN_KEY, token);
      memoryStorage.setItem(LEGACY_TOKEN_KEY, token);
    }
    if (refreshToken) {
      memoryStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    this.emitTokenChange();
  }

  getToken() {
    if (!this.token) {
      this.token = memoryStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  getRefreshToken() {
    if (!this.refreshToken) {
      this.refreshToken = memoryStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return this.refreshToken;
  }

  isTokenExpired() {
    if (!this.expiresAt) {
      const savedExpires = memoryStorage.getItem(TOKEN_EXPIRES_KEY);
      if (savedExpires) {
        this.expiresAt = parseInt(savedExpires, 10);
      }
    }
    if (!this.expiresAt) return false;
    return Date.now() >= this.expiresAt - 5 * 60 * 1000;
  }

  clearToken() {
    this.token = null;
    this.refreshToken = null;
    this.expiresAt = null;
    memoryStorage.removeItem(TOKEN_KEY);
    memoryStorage.removeItem(LEGACY_TOKEN_KEY);
    memoryStorage.removeItem(REFRESH_TOKEN_KEY);
    memoryStorage.removeItem(TOKEN_EXPIRES_KEY);
    memoryStorage.removeItem(USER_ID_KEY);
    this.emitTokenChange();
  }

  getUserId() {
    return memoryStorage.getItem(USER_ID_KEY);
  }

  setUserId(userId) {
    if (userId) {
      memoryStorage.setItem(USER_ID_KEY, String(userId));
    }
  }
}

const tokenManager = new TokenManager();
export default tokenManager;
