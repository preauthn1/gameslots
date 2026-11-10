import { router } from 'expo-router';
import { create } from 'zustand';

import { getUserInfo, getUserUnreadCount, logout as logoutApi } from '@/api/user';
import { getNavPath } from '@/services/nav-path';
import { claimPendingStatus } from '@/api/vip';
import tokenManager from '@/utils/token-manager';

const WELFARE_FETCH_TTL = 300000;
let lastWelfareFetchAt = 0;
let userInfoRequest = null;

const normalizeBalance = (value) => {
  const balance = Number(value);
  return Number.isFinite(balance) ? Math.trunc(balance * 100) / 100 : 0;
};

const normalizeUnreadCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
};

export const getAuthTokenBundle = (result) => ({
  token: result?.token || result?.data?.token || result?.user_token || result?.data?.user_token,
  refreshToken:
    result?.refreshToken || result?.refresh_token || result?.data?.refreshToken || result?.data?.refresh_token || null,
  expiresIn:
    result?.expiresIn ||
    result?.expires_in ||
    result?.expires_time ||
    result?.data?.expiresIn ||
    result?.data?.expires_in ||
    result?.data?.expires_time ||
    null,
});

export const useUserStore = create((set, get) => ({
  userInfo: null,
  isLoggedIn: Boolean(tokenManager.getToken()),
  hasWelfarePending: false,
  noticeUnreadCount: 0,
  messageUnreadCount: 0,
  showLoginModal: false,
  showRegisterModal: false,
  openLoginOnHome: false,
  showWalletDwPopup: false,
  walletDwTab: 'deposit',
  setUserInfo(info) {
    const next = { ...info, balance: normalizeBalance(info?.balance) };
    tokenManager.setUserId(next.id);
    set({ userInfo: next, isLoggedIn: true });
  },
  fetchUserInfo() {
    if (userInfoRequest) return userInfoRequest;
    userInfoRequest = (async () => {
      try {
        const result = await getUserInfo();
        get().setUserInfo(result.data || result);
        return result;
      } finally {
        userInfoRequest = null;
      }
    })();
    return userInfoRequest;
  },
  clearUserInfo() {
    tokenManager.clearToken();
    lastWelfareFetchAt = 0;
    set({
      userInfo: null,
      isLoggedIn: false,
      hasWelfarePending: false,
      noticeUnreadCount: 0,
      messageUnreadCount: 0,
    });
  },
  async logoutUser() {
    try {
      if (tokenManager.getToken()) await logoutApi();
    } catch (error) {
      console.error('用户登出失败:', error);
    } finally {
      get().clearUserInfo();
    }
  },
  updateBalance(balance) {
    const { userInfo } = get();
    if (!userInfo) return;
    set({ userInfo: { ...userInfo, balance: normalizeBalance(balance) } });
  },
  setUnreadCount({ notice_count, message_count } = {}) {
    const next = {};
    if (notice_count !== undefined) next.noticeUnreadCount = normalizeUnreadCount(notice_count);
    if (message_count !== undefined) next.messageUnreadCount = normalizeUnreadCount(message_count);
    set(next);
  },
  async fetchUnreadCount() {
    if (!get().isLoggedIn) {
      get().setUnreadCount({ notice_count: 0, message_count: 0 });
      return { notice_count: 0, message_count: 0 };
    }
    try {
      const result = await getUserUnreadCount();
      const payload = result?.data || result || {};
      get().setUnreadCount(payload);
      return payload;
    } catch (error) {
      console.error('Fetch unread count failed:', error);
      return { notice_count: get().noticeUnreadCount, message_count: get().messageUnreadCount };
    }
  },
  async fetchWelfarePendingStatus({ force = false } = {}) {
    if (!get().isLoggedIn) {
      set({ hasWelfarePending: false });
      return false;
    }
    if (!force && Date.now() - lastWelfareFetchAt < WELFARE_FETCH_TTL) {
      return get().hasWelfarePending;
    }
    try {
      const result = await claimPendingStatus({}, { showLoading: false });
      const hasPending = Boolean(result?.data?.hasPending ?? result?.hasPending);
      lastWelfareFetchAt = Date.now();
      set({ hasWelfarePending: hasPending });
      return hasPending;
    } catch (error) {
      console.error('Fetch welfare pending status failed:', error);
      return get().hasWelfarePending;
    }
  },
  openLoginModal() {
    if (getNavPath() === '/login') return;
    set({ showLoginModal: false, showRegisterModal: false, openLoginOnHome: false });
    router.push('/login');
  },
  requestLoginOnHome() {
    set({ openLoginOnHome: true });
    router.replace('/');
  },
  closeLoginModal() {
    if (getNavPath() === '/login' && router.canGoBack()) router.back();
    set({ showLoginModal: false });
  },
  openRegisterModal() {
    if (getNavPath() === '/register') return;
    set({ showLoginModal: false, showRegisterModal: false });
    router.push('/register');
  },
  closeRegisterModal() {
    if (getNavPath() === '/register' && router.canGoBack()) router.back();
    set({ showRegisterModal: false });
  },
  openWalletDwPopup(tab = 'deposit') {
    set({ walletDwTab: tab === 'withdraw' ? 'withdraw' : 'deposit', showWalletDwPopup: true });
  },
  closeWalletDwPopup() {
    set({ showWalletDwPopup: false });
  },
}));
